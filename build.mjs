// Sestaví index.html z content.mjs. `node build.mjs` vytvoří statickou verzi v dist/.
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import content from "./content.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

// Escapuje HTML a váže jednopísmenné předložky a spojky k dalšímu slovu (česká typografie).
const esc = (s) =>
  String(s).replace(/(^|[\s(„])([aiouksvzAIOUKSVZ]) /g, "$1$2 ").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function menuOptions(c = content) {
  return [...c.menus.items.map((m) => ({ id: m.id, name: m.name })), { id: c.menus.advice.id, name: c.menus.advice.name }];
}

function picture(photo, { eager = false, sizes = "100vw", cls = "" } = {}) {
  const { mobile: m, desktop: d } = photo;
  const img = `<picture>
        <source media="(min-width: 900px)" srcset="${esc(d.src)}" width="${d.width}" height="${d.height}">
        <img src="${esc(m.src)}" width="${m.width}" height="${m.height}" alt="${esc(photo.alt)}" sizes="${sizes}"${
          eager ? ' fetchpriority="high" decoding="sync"' : ' loading="lazy" decoding="async"'
        }>
      </picture>`;
  const tag = photo.placeholder ? `<span class="ph-tag">Zástupný snímek</span>` : "";
  return `<div class="photo ${cls}">${img}${tag}</div>`;
}

function field(id, label, input, { hint = "" } = {}) {
  return `<div class="field" data-field="${id}">
          <label for="f-${id}">${label}</label>
          ${hint ? `<p class="hint" id="h-${id}">${hint}</p>` : ""}
          ${input}
          <p class="err" id="e-${id}" hidden></p>
        </div>`;
}

// `offline`: statický náhled bez serveru – formulář po kontrole jen zobrazí demo hlášku.
export function render({ demo = true, offline = false } = {}) {
  const c = content;
  const opts = menuOptions(c);
  const ct = c.contact;
  const todo = (v, label) => (v ? esc(v) : demo ? `<span class="todo">${label} doplníme</span>` : "");

  const menuCards = c.menus.items
    .map(
      (m) => `<li class="card">
        ${picture(m.photo, { sizes: "(min-width: 900px) 60vw, 100vw" })}
        <div class="card-body">
          <h3>${esc(m.name)}</h3>
          <p>${esc(m.text)}</p>
          <a class="btn" href="#poptavka" data-menu="${esc(m.id)}">${esc(m.cta)}</a>
        </div>
      </li>`,
    )
    .join("\n");

  const steps = c.steps.items
    .map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`)
    .join("\n          ");

  const radios = opts
    .map(
      (o) => `<label class="choice"><input type="radio" name="menu" value="${esc(o.id)}" required aria-describedby="e-menu"><span>${esc(o.name)}</span></label>`,
    )
    .join("\n            ");

  const footerBits = [
    todo(ct.name, "Jméno"),
    ct.email ? `<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>` : todo("", "E-mail"),
    ct.phone ? `<a href="tel:${esc(ct.phone.replace(/\s/g, ""))}">${esc(ct.phone)}</a>` : todo("", "Telefon"),
  ].filter(Boolean);
  const privacy = ct.privacyUrl
    ? `<a href="${esc(ct.privacyUrl)}">Zpracování osobních údajů</a>`
    : demo
      ? `<span class="todo">Odkaz na zpracování osobních údajů doplníme</span>`
      : "";

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
  <link rel="preload" as="image" href="${esc(c.hero.photo.mobile.src)}" media="(max-width: 899px)" fetchpriority="high">
  <link rel="preload" as="image" href="${esc(c.hero.photo.desktop.src)}" media="(min-width: 900px)" fetchpriority="high">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip" href="#obsah">Přeskočit na obsah</a>
  <header class="top">
    <a class="brand" href="#uvod">${esc(c.site.brand)}</a>
    <nav aria-label="Hlavní">
      <a href="#menu">Menu</a>
      <a href="#kvetiny">Květiny</a>
      <a href="#poptavka">Poptávka</a>
    </nav>
  </header>

  <main id="obsah">
    <section class="hero" id="uvod">
      ${picture(c.hero.photo, { eager: true, sizes: "(min-width: 900px) 50vw, 100vw", cls: "hero-photo" })}
      <div class="hero-text">
        <h1>${esc(c.hero.heading)}</h1>
        <p class="lead">${esc(c.hero.text)}</p>
        <div class="actions">
          <a class="btn" href="#poptavka">${esc(c.hero.primaryCta)}</a>
          <a class="link" href="#menu">${esc(c.hero.secondaryCta)}</a>
        </div>
      </div>
    </section>

    <section class="section" id="menu">
      <div class="section-head">
        <h2>${esc(c.menus.heading)}</h2>
        <p>${esc(c.menus.text)}</p>
      </div>
      <ul class="cards">
      ${menuCards}
      <li class="card card-advice">
        <div class="card-body">
          <h3>${esc(c.menus.advice.name)}</h3>
          <p>${esc(c.menus.advice.text)}</p>
          <a class="btn btn-ghost" href="#poptavka" data-menu="${esc(c.menus.advice.id)}">${esc(c.menus.advice.cta)}</a>
        </div>
      </li>
      </ul>
    </section>

    <section class="section split" id="kvetiny">
      ${picture(c.flowers.photo, { sizes: "(min-width: 900px) 55vw, 100vw" })}
      <div class="split-text">
        <h2>${esc(c.flowers.heading)}</h2>
        <p>${esc(c.flowers.text)}</p>
      </div>
    </section>

    <section class="section" id="jak">
      <div class="section-head"><h2>${esc(c.steps.heading)}</h2></div>
      <ol class="steps">
          ${steps}
      </ol>
    </section>

    <section class="section split split-rev" id="o-mne">
      ${picture(c.about.photo, { sizes: "(min-width: 900px) 40vw, 100vw" })}
      <div class="split-text">
        <h2>${esc(c.about.heading)}</h2>
        <p class="quote">${esc(c.about.text)}</p>
        ${c.about.memory ? `<p>${esc(c.about.memory)}</p>` : ""}
      </div>
    </section>

    <section class="section form-section" id="poptavka">
      <div class="section-head">
        <h2>${esc(c.form.heading)}</h2>
        <p>${esc(c.form.text)}</p>
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
        <button class="btn btn-submit" type="submit">${esc(c.form.submit)}</button>
        <div id="form-status" class="status" role="status" aria-live="polite" tabindex="-1"></div>
        <noscript><p class="status status-error is-on">K odeslání poptávky je potřeba zapnutý JavaScript.</p></noscript>
      </form>
    </section>
  </main>

  <footer class="foot">
    <p class="foot-brand">${esc(c.site.brand)}</p>
    <p>${footerBits.join(" · ")}</p>
    <p>${privacy}</p>
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
