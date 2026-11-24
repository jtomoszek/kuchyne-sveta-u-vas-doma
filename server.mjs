// Lokální náhled + příjem poptávek. Bez závislostí: `node server.mjs`
import http from "node:http";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import content from "./content.mjs";
import { render, menuOptions } from "./build.mjs";
import { validateInquiry } from "./public/validate.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const PORT = Number(process.env.PORT) || 4173;

// Tajné hodnoty jen z prostředí serveru, nikdy v klientském kódu.
const WEBHOOK_URL = process.env.INQUIRY_WEBHOOK_URL || "";
const WEBHOOK_SECRET = process.env.INQUIRY_WEBHOOK_SECRET || "";
const DEMO = !WEBHOOK_URL;

const TOKEN_KEY = process.env.FORM_TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const MIN_FILL_MS = 2500; // člověk formulář rychleji nevyplní
const MAX_TOKEN_MS = 24 * 60 * 60 * 1000;
// Limity na jednu IP adresu za 10 minut: všechny požadavky / platné poptávky k předání.
const RATE = { windowMs: 10 * 60 * 1000, maxRequests: 30, maxInquiries: 5 };
const hits = new Map();

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

const sign = (ts) => crypto.createHmac("sha256", TOKEN_KEY).update(String(ts)).digest("hex");
const newToken = () => {
  const ts = Date.now();
  return `${ts}.${sign(ts)}`;
};
function tokenAge(token) {
  const [ts, mac] = String(token || "").split(".");
  if (!/^\d+$/.test(ts || "") || !mac) return null;
  const good = sign(ts);
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  return Date.now() - Number(ts);
}

function rateLimited(key, max) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < RATE.windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 10000) hits.clear();
  return list.length > max;
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 10_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("too large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function deliver(inquiry) {
  const menuName = menuOptions().find((m) => m.id === inquiry.menu)?.name || inquiry.menu;
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(WEBHOOK_SECRET ? { Authorization: `Bearer ${WEBHOOK_SECRET}` } : {}),
    },
    body: JSON.stringify({ ...inquiry, menuName, receivedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

async function handleInquiry(req, res) {
  const ip = req.socket.remoteAddress || "?";
  if (rateLimited(`r:${ip}`, RATE.maxRequests)) return json(res, 429, { ok: false, code: "rate" });
  if (!String(req.headers["content-type"] || "").startsWith("application/json")) {
    return json(res, 415, { ok: false, code: "type" });
  }
  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { ok: false, code: "body" });
  }

  // Ochrana proti spamu: skryté pole a podepsaný čas načtení formuláře.
  if (typeof data.company_fax === "string" && data.company_fax !== "") return json(res, 400, { ok: false, code: "spam" });
  const age = tokenAge(data.token);
  if (age === null || age < MIN_FILL_MS || age > MAX_TOKEN_MS) return json(res, 400, { ok: false, code: "token" });

  const { errors, value } = validateInquiry(data, {
    menuIds: menuOptions().map((m) => m.id),
    maxGuests: content.form.maxGuests,
  });
  if (Object.keys(errors).length) return json(res, 422, { ok: false, code: "invalid", errors });

  if (DEMO) return json(res, 200, { ok: false, demo: true });
  if (rateLimited(`i:${ip}`, RATE.maxInquiries)) return json(res, 429, { ok: false, code: "rate" });

  try {
    await deliver(value);
  } catch (e) {
    console.error("Poptávku se nepodařilo předat:", e.message);
    return json(res, 502, { ok: false, code: "delivery" });
  }
  return json(res, 200, { ok: true });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/api/poptavka") {
      if (req.method !== "POST") return json(res, 405, { ok: false });
      return await handleInquiry(req, res);
    }
    if (url.pathname === "/api/form-token" && req.method === "GET") return json(res, 200, { token: newToken() });

    if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { ok: false });
    if (url.pathname === "/" || url.pathname === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      return res.end(render({ demo: DEMO }));
    }
    const file = path.normalize(path.join(publicDir, decodeURIComponent(url.pathname)));
    if (!file.startsWith(publicDir + path.sep)) return json(res, 403, { ok: false });
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch (e) {
    if (e.code === "ENOENT" || e.code === "EISDIR") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Nenalezeno");
    }
    console.error(e);
    if (!res.headersSent) json(res, 500, { ok: false });
  }
});

server.listen(PORT, () => {
  console.log(`Náhled běží na http://localhost:${PORT} (${DEMO ? "formulář v demo režimu" : "poptávky se předávají na webhook"})`);
});
