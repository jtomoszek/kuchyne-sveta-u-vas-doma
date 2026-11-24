// Sestaví index.html z content.mjs. `node build.mjs` vytvoří statickou verzi v dist/.
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import content from "./content.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const mark = readFileSync(path.join(root, "public/brand/mark.svg"), "utf8").trim();

// Escapuje HTML a váže jednopísmenné předložky a spojky k dalšímu slovu (česká typografie).
const esc = (s) =>
  String(s)
    .replace(/(^|[\s(„])([aiouksvzAIOUKSVZ]) /g, "$1$2\u00a0")
    .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function menuOptions(c = content) {
  return [...c.menus.items.map((m) => ({ id: m.id, name: m.name })), { id: c.menus.advice.id, name: c.menus.advice.name }];
}

function img(photo, { eager = false, cls = "" } = {}) {
  const size = photo.width ? ` width="${photo.width}" height="${photo.height}"` : "";
  const load = eager ? ' fetchpriority="high" decoding="sync"' : ' loading="lazy" decoding="async"';
  return `<img${cls ? ` class="${cls}"` : ""} src="${esc(photo.src)}" alt="${esc(photo.alt ?? "")}"${size}${load}>`;
}

function field(id, label, input, { hint = "" } = {}) {
  return `<div class="field" data-field="${id}">
          <label for="f-${id}">${label}</label>
          ${hint ? `<p class="hint" id="h-${id}">${hint}</p>` : ""}
          ${input}
          <p class="err" id="e-${id}" hidden></p>
        </div>`;
}

const brand = (c) => `<span class="brand-mark">${mark}</span><span class="brand-name">${esc(c.site.brand)}</span>`;

// `offline`: statický náhled bez serveru – formulář po kontrole jen zobrazí demo hlášku.
export function render({ demo = true, offline = false } = {}) {
  const c = content;
  const opts = menuOptions(c);
  const ct = c.contact;
  const todo = (v, label) => (v ? esc(v) : demo ? `<span class="todo">${label} doplníme</span>` : "");

  const pillars = c.chef.pillars.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join("\n          ");

  const portrait = c.chef.portrait.src
    ? `<li class="polaroid">${img(c.chef.portrait)}<p>${esc(c.chef.portrait.caption)}</p></li>`
    : demo
      ? `<li class="polaroid"><div class="polaroid-empty">Portrét Oksany doplníme</div><p>${esc(c.chef.portrait.caption)}</p></li>`
      : "";
  const gallery = c.chef.gallery
    .map((g) => `<li class="polaroid">${img({ src: g.src, alt: "", width: 360, height: 360 })}<p>${esc(g.caption)}</p></li>`)
    .join("\n          ");

  const menuItems = c.menus.items
    .map(
      (m) => `<li>
            <h3>${esc(m.name)}</h3>
            <p>${esc(m.text)}</p>
            <a class="btn btn-soft" href="#poptavka" data-menu="${esc(m.id)}">${esc(m.cta)}</a>
          </li>`,
    )
    .join("\n");

  const steps = c.steps.items.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("\n        ");

  const radios = opts
    .map(
      (o) => `<label class="choice"><input type="radio" name="menu" value="${esc(o.id)}" required aria-describedby="e-menu"><span>${esc(o.name)}</span></label>`,
    )
    .join("\n            ");

  const footerBits = [
    todo(ct.name, "Jméno"),
    ct.email ? `<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : todo("", "E-mail"),
    ct.phone ? `<a href="tel:${esc(ct.phone.replace(/\s/g, ""))}">${esc(ct.phone)}</a>` : todo("", "Telefon"),
    ct.privacyUrl
      ? `<a href="${esc(ct.privacyUrl)}">Zpracování osobních údajů</a>`
      : todo("", "Odkaz na zpracování osobních údajů"),
  ].filter(Boolean);

  const config = {
    endpoint: c.form.endpoint,
    offline: demo && offline,
    menuIds: opts.map((o) => o.id),
    maxGuests: c.form.maxGuests,
    messages: { success: c.form.success, error: c.form.error, demo: c.form.demoResult },
  };

  return `<!doctype html>
<html lang="${esc(c.site.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.site.title)}</title>
  <meta name="description" content="${esc(c.site.description)}">
  ${demo ? '<meta name="robots" content="noindex">' : ""}
  <link rel="icon" href="brand/mark.svg" type="image/svg+xml">
  <link rel="preload" as="image" href="${esc(c.hero.photo.src)}" fetchpriority="high">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Geist:wght@400;500&family=La+Belle+Aurore&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip" href="#obsah">Přeskočit na obsah</a>

  <main id="obsah">
    <section class="hero" id="uvod">
      ${img(c.hero.photo, { eager: true, cls: "hero-bg" })}
      <header class="top">
        <nav aria-label="Hlavní">
          <a href="#oksana">Oksana</a>
          <a href="#menu">Menu</a>
          <a href="#kvetiny">Květiny</a>
        </nav>
        <a class="brand" href="#uvod" aria-label="${esc(c.site.brand)}">${brand(c)}</a>
        <a class="btn btn-outline top-cta" href="#poptavka">Poptávka</a>
      </header>
      <div class="hero-content">
        <h1>${esc(c.hero.heading)}</h1>
        <div class="hero-side">
          <p class="lead">${esc(c.hero.text)}</p>
          <div class="actions">
            <a class="btn btn-light" href="#poptavka">${esc(c.hero.primaryCta)}</a>
            <a class="link" href="#menu">${esc(c.hero.secondaryCta)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="intro">
      ${img(c.intro.photo, { cls: "intro-plate" })}
      <p class="script intro-script">${esc(c.intro.script)}</p>
    </section>

    <section class="chef" id="oksana">
      <div class="center">
        ${img({ ...c.chef.illustration, width: 200, height: 200 }, { cls: "illu" })}
        <p class="script">${esc(c.chef.kicker)}</p>
        <h2 class="display">${esc(c.chef.heading)}</h2>
        ${c.chef.paragraphs.map((p) => `<p class="body">${esc(p)}</p>`).join("\n        ")}
        ${c.chef.memory ? `<p class="body">${esc(c.chef.memory)}</p>` : ""}
        <blockquote class="script chef-quote">
          <p>„${esc(c.chef.quote)}“</p>
          <footer>— ${esc(c.chef.quoteBy)}</footer>
        </blockquote>
      </div>
      <ul class="polaroids" aria-label="Fotografie">
          ${portrait}
          ${gallery}
      </ul>
      <ul class="cols">
          ${pillars}
      </ul>
    </section>

    <section class="menu" id="menu">
      ${img(c.menus.photo, { cls: "menu-bg" })}
      <div class="paper">
        ${img({ ...c.menus.illustration, width: 100, height: 100 }, { cls: "illu illu-sm" })}
        <h2>${esc(c.menus.heading)}</h2>
        <p class="body">${esc(c.menus.text)}</p>
        <ul class="menu-list">
          ${menuItems}
          <li>
            <h3>${esc(c.menus.advice.name)}</h3>
            <p>${esc(c.menus.advice.text)}</p>
            <a class="btn btn-soft" href="#poptavka" data-menu="${esc(c.menus.advice.id)}">${esc(c.menus.advice.cta)}</a>
          </li>
        </ul>
        ${c.menus.script ? `<p class="script paper-script">${esc(c.menus.script)}</p>` : ""}
      </div>
    </section>

    <section class="steps-section" id="jak">
      <h2>${esc(c.steps.heading)}</h2>
      <ol class="cols steps">
        ${steps}
      </ol>
    </section>

    <section class="flowers" id="kvetiny">
      <div class="flowers-photo">${img(c.flowers.photo)}</div>
      <div class="flowers-text">
        <p class="script">${esc(c.flowers.kicker)}</p>
        <h2>${esc(c.flowers.heading)}</h2>
        <p class="body">${esc(c.flowers.text)}</p>
      </div>
    </section>

    <section class="inquiry" id="poptavka">
      <div class="center">
        <h2>${esc(c.form.heading)}</h2>
        <p class="body">${esc(c.form.text)}</p>
      </div>
      <form id="inquiry" action="${esc(c.form.endpoint)}" method="post" novalidate>
        ${demo ? `<p class="demo-badge">${esc(c.form.demoBadge)}</p>` : ""}
        ${field("name", "Jméno", `<input id="f-name" name="name" type="text" autocomplete="name" required maxlength="100" aria-describedby="e-name">`)}
        ${field("email", "E-mail", `<input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" aria-describedby="e-email">`)}
        <div class="row">
          ${field("city", "Město", `<input id="f-city" name="city" type="text" autocomplete="address-level2" required maxlength="100" aria-describedby="e-city h-city">`, { hint: "Přesnou adresu zatím nepotřebuji." })}
          ${field("guests", "Počet hostů", `<input id="f-guests" name="guests" type="number" inputmode="numeric" min="1" max="${c.form.maxGuests}" required aria-describedby="e-guests">`)}
        </div>
        <div class="field" data-field="date">
          <label for="f-date">Termín</label>
          <input id="f-date" name="date" type="date" aria-describedby="e-date">
          <label class="check"><input type="checkbox" name="dateUnknown" id="f-dateUnknown"><span>Termín ještě nevím</span></label>
          <p class="err" id="e-date" hidden></p>
        </div>
        <fieldset class="field" data-field="menu">
          <legend>Menu</legend>
          <div class="choices">
            ${radios}
          </div>
          <p class="err" id="e-menu" hidden></p>
        </fieldset>
        ${field("note", `Poznámka <span class="opt">(nepovinné)</span>`, `<textarea id="f-note" name="note" rows="4" maxlength="2000" aria-describedby="e-note"></textarea>`)}
        <label class="check check-flowers"><input type="checkbox" name="flowers"><span>Mám zájem i o květiny a výzdobu</span></label>
        <div class="hp" aria-hidden="true">
          <label for="f-hp">Toto pole nevyplňujte</label>
          <input id="f-hp" name="company_fax" type="text" tabindex="-1" autocomplete="off">
        </div>
        <button class="btn btn-dark btn-submit" type="submit">${esc(c.form.submit)}</button>
        <div id="form-status" class="status" role="status" aria-live="polite" tabindex="-1"></div>
        <noscript><p class="status status-error is-on">K odeslání poptávky je potřeba zapnutý JavaScript.</p></noscript>
      </form>
    </section>
  </main>

  <footer class="foot">
    ${img(c.footer.photo, { cls: "foot-bg" })}
    <div class="foot-inner">
      <p class="foot-heading">${esc(c.footer.heading)}</p>
      <div class="foot-meta">
        <span class="brand">${brand(c)}</span>
        <p>${footerBits.join(" ")}</p>
      </div>
      ${demo && c.site.previewNote ? `<p class="foot-note">${esc(c.site.previewNote)}</p>` : ""}
    </div>
  </footer>

  <script type="application/json" id="site-config">${JSON.stringify(config).replace(/</g, "\\u003c")}</script>
  <script type="module" src="app.js"></script>
</body>
</html>
`;
}

// Statický export: node build.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = path.join(root, "dist");
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(root, "public"), dist, { recursive: true });
  const demo = !process.env.INQUIRY_WEBHOOK_URL;
  await writeFile(path.join(dist, "index.html"), render({ demo, offline: true }));
  console.log(`dist/ hotovo (${demo ? "demo formulář" : "ostrý formulář"})`);
}
