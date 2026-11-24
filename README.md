# By Velychko – kuchyně světa u vás doma

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
| `public/brand/`, `public/photos/`, `public/fonts/` | Logo, vlastní fotky a písma. |
| `server.mjs` | Náhled a příjem poptávek. |

Nové menu: přidejte položku do `menus.items` v `content.mjs` (`id`, název, text, tlačítko). Položka na kartě i volba ve formuláři vzniknou samy. Vzpomínka z cest se zobrazí, jakmile vyplníte `chef.memory`.

## Vzhled, fotky a písma

Vzhled vychází ze šablony [La Brisa](https://labrisa.framer.website/) a slouží jako návrh pro klientku.

- **Fotky a ilustrace** se zatím načítají přímo ze šablony (adresy `framerusercontent.com` v `content.mjs`). Jsou jen ukázkové; na ostrý web k nim nemáme práva. Vlastní fotky nahrajte do `public/photos/` a v `content.mjs` přepište `src` (např. `"photos/uvod.jpg"`). Portrét Oksany se zobrazí po vyplnění `chef.portrait.src`.
- **Nadpisy v písmu Albra:** stránka ho zatím bere jen z písem nainstalovaných v počítači. Kdo Albru nainstalovanou nemá, uvidí náhradní DM Serif Display. Licencované webové soubory (`.woff2`) uložte do `public/fonts/` a v `public/styles.css` doplňte do obou `@font-face` řádek `url("fonts/…woff2") format("woff2")`. Zkušební (TRIAL) soubory na web nepatří.
- **Ostatní písma** (Geist, ručně psané La Belle Aurore, DM Serif Display) se načítají z Google Fonts.
- **Logo:** značka je v `public/brand/mark.svg`, název „By Velychko“ se píše Albrou.

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

- texty o Oksaně (sekce `chef` v `content.mjs`) – jsou návrh, potřebují její schválení
- licenci na šablonu La Brisa, pokud má vzhled zůstat takto blízko předloze
- regiony a menu (teď jedna pracovní ukázka „Večer v Provence“)
- výzdobu: doplněk, nebo součást vybraných menu
- oblast dojezdu
- vlastní fotky
- kontaktní údaje a text o zpracování osobních údajů (`contact` v `content.mjs`)
- nejvyšší počet hostů (`form.maxGuests`, teď 100)

## Náhled pro klientku

Statický náhled běží na GitHub Pages z větve `gh-pages`: <https://jtomoszek.github.io/kuchyne-sveta-u-vas-doma/>. Formulář v něm jen kontroluje údaje a nic neodesílá, stránka má `noindex`. Aktualizace náhledu po změnách:

```bash
npm run preview:deploy
```

Ostrý web zatím není nikde nasazený.
