// Společná pravidla pro prohlížeč i server (server je vždy rozhodující).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v) => (typeof v === "string" ? v.trim() : "");

export function todayISO(now = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/**
 * @param {object} input surová data z formuláře
 * @param {{menuIds: string[], maxGuests: number, today?: string}} opts
 * @returns {{errors: Record<string,string>, value: object}}
 */
export function validateInquiry(input, opts) {
  const errors = {};
  const d = input && typeof input === "object" ? input : {};

  const name = str(d.name);
  if (name.length < 2 || name.length > 100) errors.name = "Napište prosím své jméno.";

  const email = str(d.email);
  if (email.length > 200 || !EMAIL.test(email)) errors.email = "Zadejte platný e-mail, ať se vám mohu ozvat.";

  const city = str(d.city);
  if (city.length < 2 || city.length > 100) errors.city = "Napište město, kde budete hostit.";

  const guestsRaw = str(String(d.guests ?? ""));
  const guests = /^\d{1,3}$/.test(guestsRaw) ? Number(guestsRaw) : NaN;
  if (!(guests >= 1 && guests <= opts.maxGuests)) {
    errors.guests = `Zadejte počet hostů (1–${opts.maxGuests}).`;
  }

  const dateUnknown = d.dateUnknown === true || d.dateUnknown === "on" || d.dateUnknown === "true";
  let date = str(d.date);
  if (dateUnknown) {
    date = "";
  } else {
    const parsed = DATE.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    const valid = parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    if (!valid) errors.date = "Vyberte termín, nebo zaškrtněte „Termín ještě nevím“.";
    else if (date < (opts.today || todayISO())) errors.date = "Termín už proběhl, vyberte prosím jiný.";
  }

  const menu = str(d.menu);
  if (!opts.menuIds.includes(menu)) errors.menu = "Vyberte menu, nebo volbu „Nechám si poradit“.";

  const note = str(d.note);
  if (note.length > 2000) errors.note = "Poznámka je příliš dlouhá (nejvýše 2000 znaků).";

  const flowers = d.flowers === true || d.flowers === "on" || d.flowers === "true";

  return { errors, value: { name, email, city, guests, date, dateUnknown, menu, note, flowers } };
}
