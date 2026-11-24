import { validateInquiry } from "./validate.js";

const config = JSON.parse(document.getElementById("site-config").textContent);
const form = document.getElementById("inquiry");
const statusEl = document.getElementById("form-status");
const dateInput = form.elements.date;
const dateUnknown = form.elements.dateUnknown;
const submitBtn = form.querySelector("button[type=submit]");

// Termín nejdřív od dneška.
const now = new Date();
dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// Tlačítka u menu předvyplní volbu ve formuláři (dá se dál změnit).
document.querySelectorAll("a[data-menu]").forEach((link) => {
  link.addEventListener("click", () => {
    const radio = form.querySelector(`input[name="menu"][value="${CSS.escape(link.dataset.menu)}"]`);
    if (radio) {
      radio.checked = true;
      clearError("menu");
    }
  });
});

dateUnknown.addEventListener("change", () => {
  dateInput.disabled = dateUnknown.checked;
  if (dateUnknown.checked) clearError("date");
});

// Podepsaný čas načtení formuláře (ochrana proti spamu) – vyžádá se při prvním doteku formuláře.
const tokenUrl = new URL("form-token", new URL(config.endpoint, location.href));
let tokenPromise = null;
function getToken(fresh = false) {
  if (!tokenPromise || fresh) {
    tokenPromise = fetch(tokenUrl)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => d.token || "")
      .catch(() => "");
  }
  return tokenPromise;
}
form.addEventListener("focusin", () => getToken(), { once: true });

function fieldBox(name) {
  return form.querySelector(`[data-field="${name}"]`);
}
function clearError(name) {
  const box = fieldBox(name);
  if (!box) return;
  box.classList.remove("has-error");
  const err = box.querySelector(".err");
  err.hidden = true;
  err.textContent = "";
  box.querySelectorAll("input, textarea").forEach((el) => el.removeAttribute("aria-invalid"));
}
function showErrors(errors) {
  let first = null;
  for (const [name, message] of Object.entries(errors)) {
    const box = fieldBox(name);
    if (!box) continue;
    box.classList.add("has-error");
    const err = box.querySelector(".err");
    err.textContent = message;
    err.hidden = false;
    const input = box.querySelector("input:not([type=checkbox]), textarea");
    box.querySelectorAll("input:not([type=checkbox]), textarea").forEach((el) => el.setAttribute("aria-invalid", "true"));
    first ||= input;
  }
  first?.focus();
}
function setStatus(kind, message) {
  statusEl.className = `status ${kind ? `status-${kind} is-on` : ""}`;
  statusEl.textContent = message || "";
}

form.addEventListener("input", (e) => {
  const box = e.target.closest("[data-field]");
  if (box?.classList.contains("has-error")) clearError(box.dataset.field);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;
  setStatus("", "");
  ["name", "email", "city", "guests", "date", "menu", "note"].forEach(clearError);

  const fd = new FormData(form);
  const data = {
    name: fd.get("name"),
    email: fd.get("email"),
    city: fd.get("city"),
    guests: fd.get("guests"),
    date: fd.get("date") || "",
    dateUnknown: dateUnknown.checked,
    menu: fd.get("menu") || "",
    note: fd.get("note"),
    flowers: form.elements.flowers.checked,
    company_fax: fd.get("company_fax"),
  };

  const { errors } = validateInquiry(data, config);
  if (Object.keys(errors).length) return showErrors(errors);

  submitBtn.disabled = true;
  const label = submitBtn.textContent;
  submitBtn.textContent = "Odesílám…";
  try {
    data.token = await getToken();
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 422 && body.errors) {
      showErrors(body.errors);
    } else if (res.ok && body.ok === true) {
      // Úspěch až po potvrzeném přijetí serverem.
      form.reset();
      dateInput.disabled = false;
      setStatus("success", config.messages.success);
      statusEl.focus();
    } else if (res.ok && body.demo) {
      setStatus("demo", config.messages.demo);
      statusEl.focus();
    } else {
      throw new Error(body.code || String(res.status));
    }
  } catch {
    getToken(true); // nový token pro další pokus; vyplněné údaje zůstávají
    setStatus("error", config.messages.error);
    statusEl.focus();
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = label;
  }
});
