# Kuchyně světa u vás doma

Jednostránkový web osobní šéfkuchařky. Statická stránka sestavená z jednoho souboru s obsahem a malý Node server, který přijímá poptávky. Žádné závislosti, žádný CMS.

## Spuštění náhledu

Potřebujete Node 20 nebo novější.

```bash
npm start
```

Náhled běží na <http://localhost:4173>. Po úpravě `content.mjs` server restartujte; úpravy v `public/` stačí obnovit v prohlížeči.

## Kde co je

| Soubor | Obsah |
| --- | --- |
| `content.mjs` | **Všechny texty, menu, fotky a kontakty.** Upravuje se jen tady. |
| `build.mjs` | Šablona stránky (HTML). |
| `public/styles.css`, `public/app.js` | Vzhled a chování formuláře. |
| `public/validate.js` | Pravidla formuláře, společná pro prohlížeč i server. |
| `public/photos/` | Fotky (zatím označené zástupné snímky). |
| `server.mjs` | Náhled a příjem poptávek. |

Nové menu: přidejte položku do `menus.items` v `content.mjs` (`id`, název, text, tlačítko, fotka). Karta i volba ve formuláři vzniknou samy. Vzpomínka z cest se zobrazí, jakmile vyplníte `about.memory`.

## Výměna fotek

Každá fotka má dva výřezy. Nahrajte soubory do `public/photos/` (ideálně WebP nebo JPEG), v `content.mjs` přepište `src`, `width`, `height` a `alt` a nastavte `placeholder: false` – zmizí štítek „Zástupný snímek“.

| Fotka | Mobil | Desktop |
| --- | --- | --- |
| Úvod (jídlo na stole s květinami) | na šířku 4:3, cca 1200 × 900 | na výšku 4:5, cca 1600 × 2000 |
| Menu (každé zvlášť) | 4:3, cca 1200 × 900 | 16:10, cca 1600 × 1000 |
| Květiny | na výšku 4:5, cca 1200 × 1500 | na šířku 3:2, cca 1600 × 1067 |
| Portrét | čtverec, cca 1200 × 1200 | na výšku 4:5, cca 1200 × 1500 |

Úvodní fotka se načítá přednostně, ostatní až při posunu. Hlavní motiv držte uprostřed, stránka fotky ořezává na střed.

## Zapojení příjmu poptávek

Dokud není nastavený příjemce, je formulář označený jako **demo**: údaje zkontroluje, ale nic neodešle a nezobrazí potvrzení o úspěchu.

Server předává ověřené poptávky jako JSON na webhook (Make, Zapier, n8n nebo vlastní služba, která z nich pošle e-mail). Nastavuje se proměnnými prostředí na serveru – nic tajného není v klientském kódu:

```bash
INQUIRY_WEBHOOK_URL="https://…" INQUIRY_WEBHOOK_SECRET="…" npm start
```

- `INQUIRY_WEBHOOK_URL` – kam se poptávka posílá (POST, JSON). Nastavením se vypne demo režim.
- `INQUIRY_WEBHOOK_SECRET` – nepovinné, pošle se v hlavičce `Authorization: Bearer …`.
- `FORM_TOKEN_SECRET` – nastavte při provozu ve více instancích nebo s restarty, jinak se generuje při startu.
- `PORT` – výchozí 4173.

Odesílaná data: `name`, `email`, `city`, `guests`, `date`, `dateUnknown`, `menu`, `menuName`, `note`, `flowers`, `receivedAt`. Úspěch se zákazníkovi zobrazí až ve chvíli, kdy webhook odpoví kódem 2xx; jinak uvidí chybu a údaje zůstanou vyplněné.

Ochrana proti spamu: skryté pole, podepsaný čas načtení formuláře (odeslání dřív než za 2,5 s se odmítne) a limit 5 poptávek za 10 minut z jedné IP adresy. Za reverzní proxy je potřeba limit navázat na skutečnou adresu návštěvníka.

`npm run build` vytvoří statickou verzi v `dist/`. Formulář i tak potřebuje běžící `server.mjs` (nebo jinou službu se stejným rozhraním); její adresu nastavíte ve `form.endpoint` v `content.mjs`.

## Před publikací potvrdit s klientkou

- jméno a značku (teď pracovní název v `site.brand`)
- regiony a menu (teď jedna pracovní ukázka „Večer v Provence“)
- výzdobu: doplněk, nebo součást vybraných menu
- oblast dojezdu
- vlastní fotky
- kontaktní údaje a text o zpracování osobních údajů (`contact` v `content.mjs`)
- nejvyšší počet hostů (`form.maxGuests`, teď 100)

Web zatím není nikde nasazený. V demo režimu má stránka `noindex`.
