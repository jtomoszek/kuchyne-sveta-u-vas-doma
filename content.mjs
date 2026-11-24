// Jediný zdroj textů, menu, fotek a kontaktů.
// Po úpravě restartujte `npm start` (nebo spusťte `npm run build`).
// Prázdná hodnota ("") = údaj se na webu nezobrazí, případně se v náhledu označí „doplníme“.

// UKÁZKOVÉ FOTKY: zatím se načítají přímo ze šablony La Brisa (framerusercontent.com).
// Slouží jen k předvedení vzhledu. Před spuštěním je nahraďte vlastními soubory
// v public/photos/ a do `src` napište např. "photos/uvod.jpg".
const demo = (id, width = 2048) => `https://framerusercontent.com/images/${id}?scale-down-to=${width}`;

export default {
  site: {
    brand: "By Velychko",
    title: "By Velychko – kuchyně světa u vás doma",
    description:
      "Osobní šéfkuchařka Oksana vaří u vás doma. Menu inspirovaná kuchyněmi světa, na přání i květiny a výzdoba stolu.",
    lang: "cs",
    // Poznámka v patičce náhledu (zobrazí se jen v demo režimu).
    previewNote:
      "Návrh vzhledu. Fotografie jsou ilustrační ze šablony La Brisa, před spuštěním je nahradí vlastní.",
  },

  hero: {
    heading: "Kuchyně světa u vás doma",
    text: "Řekněte mi, do které části světa vás mám vzít. Navrhnu menu a přijedu ho uvařit k vám domů. A jestli chcete slavnostně prostřít, s dcerou doladíme stůl květinami.",
    primaryCta: "Naplánovat večeři",
    secondaryCta: "Prohlédnout menu",
    photo: { src: demo("5AuNu07ibivkOAc26NbeFl737Gw.jpeg"), alt: "Jídlo a nápoje na prostřeném stole s květinami" },
  },

  // Talíř pod úvodem a ručně psaná věta.
  intro: {
    photo: { src: demo("v5imz6q7mwOy14CcVQaoDhMTTeQ.png", 1024), alt: "Hotový chod na talíři", width: 600, height: 600 },
    script: "Chutě, které Oksana přivezla z cest. Večer, který zůstane u vás doma.",
  },

  // Hlavní sekce o šéfkuchařce.
  chef: {
    kicker: "Kdo vám bude vařit",
    heading: "Zážitek má jméno. Oksana.",
    paragraphs: [
      "Skvělou restauraci dnes najdete v každém větším městě. Večer, který patří jen vám a vašim hostům, se ale rezervovat nedá. Ten musí někdo uvařit.",
      "Oksana poznávala svět přes jeho kuchyně a tyhle chutě dnes přiváží tam, kde je vám nejlíp: k vašemu vlastnímu stolu. Navrhne menu, přijede a uvaří. Vy máte na starosti jediné, být se svými hosty.",
    ],
    quote: "Na cestách jsem poznávala svět přes jídlo. Teď tyhle chutě přivážím k vašemu stolu.",
    quoteBy: "Oksana",
    // Jedna krátká skutečná vzpomínka z cest. Dokud je prázdná, nezobrazuje se.
    memory: "",
    pillars: [
      {
        title: "Menu psané pro vás",
        text: "Žádný stálý lístek. Každé menu vzniká pro jeden stůl, jednu příležitost a jedny hosty.",
      },
      {
        title: "U vás doma",
        text: "Vaše kuchyně, váš stůl, vaše soukromí. Nikam nejedete, nic nehlídáte a nikdo vás nepobízí k odchodu.",
      },
      {
        title: "Jednáte přímo s Oksanou",
        text: "Termín, menu i cenu s vámi doladí osobně. Víte, kdo vám bude vařit, ještě než prostřete.",
      },
    ],
    illustration: { src: demo("zxDNXbbqhdWsSYX6J6jJd2sxvas.png", 512), alt: "" },
    // Portrét Oksany: dokud je `src` prázdné, ukáže se v náhledu rámeček „doplníme“.
    portrait: { src: "", alt: "Oksana při vaření", caption: "Oksana" },
    // Fotky s ručně psaným popiskem.
    gallery: [
      { src: demo("JafhoJNZUYpiUFP2bnqhSn6KJX0.jpg", 1024), caption: "Stůl, od kterého se nevstává" },
      { src: demo("xFs0kx2phX41SbKf6ObEJXih9MY.jpg", 1024), caption: "Chutě z cest" },
      { src: demo("tpu1p4QLuKygEBsW0kxEB82qIEY.jpg", 1024), caption: "Svět na dosah vidličky" },
      { src: demo("FJ7Zr3FnDicn00IV8Jwu5wH58.jpg", 1024), caption: "Každý chod má svůj důvod" },
      { src: demo("bGxpHumvgar4dANAm7E960Uko.jpg", 1024), caption: "Hosté jsou vaše starost. Zbytek moje." },
    ],
  },

  menus: {
    heading: "Na který kout světa máte chuť?",
    text: "Vyberte si zemi nebo kraj, kam se chcete od svého stolu podívat, a já vás provedu jeho chutěmi. A když si nevíte rady, řekněte mi, co máte rádi. Cíl cesty vyberu já.",
    photo: { src: demo("4uEHM0uSAhR7qVN3OtUfGSe4.jpg"), alt: "" },
    illustration: { src: demo("ywbuxxbL1FbxT4v1B50RgUaQjpI.png", 512), alt: "" },
    // Další menu přidávejte až z podkladů klientky. `id` se posílá s poptávkou.
    items: [
      {
        id: "provence",
        name: "Večer v Provence",
        text: "Jižní Francie u vašeho stolu. Sezonní zelenina, čerstvé bylinky a menu sestavené pro vás a vaše hosty.",
        cta: "Mám chuť na Provence",
      },
    ],
    // Volba bez konkrétního menu.
    advice: {
      id: "poradit",
      name: "Nechám si poradit",
      text: "Nevíte, kterou kuchyni zvolit? Napište mi, co máte rádi, a menu navrhnu já.",
      cta: "Nechám si poradit",
    },
    script: "Další kouty světa přibývají",
  },

  steps: {
    heading: "Jak to probíhá",
    items: [
      {
        title: "Řeknete mi, co plánujete",
        text: "Napište, kdy a kde chcete hostit a kolik vás bude.",
      },
      {
        title: "Společně doladíme menu",
        text: "Vyberete si kuchyni, nebo vám navrhnu, co by se k vašemu večeru hodilo. Podle přání doladíme i květiny.",
      },
      {
        title: "Přijedu a uvařím u vás",
        text: "V domluvený den vařím u vás doma. Vy můžete být se svými hosty.",
      },
    ],
  },

  flowers: {
    kicker: "Květiny a výzdoba",
    heading: "Večer, ve kterém všechno hraje",
    text: "Jídlo je zážitek. Ale teprve stůl, od kterého se nikomu nechce vstávat, z něj dělá večer. Moje dcera má vlastní květinářství, a pokud si to budete přát, promění místo, kde hostíte, tak, aby ladilo s menu, s příležitostí i s vámi. Já přivezu chutě, ona atmosféru. Vy jen otevřete dveře hostům.",
    photo: { src: demo("8QBDsI4aoX6CdeZjfIcJ0Pw8uZU.jpg", 1024), alt: "Stoly mezi zelení a květinami", width: 559, height: 746 },
  },

  form: {
    kicker: "Poptávka",
    heading: "Co si uvaříme?",
    text: "Povězte mi, co máte v plánu. Ozvu se vám a společně doladíme termín, menu a cenu.",
    submit: "Odeslat poptávku",
    success: "Děkuji za poptávku. Ozvu se a doladíme termín i menu.",
    error: "Poptávku se nepodařilo odeslat. Údaje zůstaly vyplněné, můžete to zkusit znovu.",
    demoBadge: "Demo náhled – formulář zatím nikam neodesílá.",
    demoResult:
      "Demo náhled: údaje prošly kontrolou, ale poptávka se nikam neodeslala. Příjem poptávek zatím není zapojený.",
    // Adresa, kam formulář posílá data. Při hostování serveru jinde zadejte celou URL.
    endpoint: "/api/poptavka",
    maxGuests: 100,
  },

  // Patička. Prázdné údaje se v náhledu zobrazí jako „doplníme“.
  footer: {
    heading: "Na shledanou u vašeho stolu",
    photo: { src: demo("bKEU9NDSGg08PPfqLx2IJMLwOA.jpg"), alt: "" },
  },
  contact: {
    name: "",
    email: "",
    phone: "",
    privacyUrl: "",
  },
};
