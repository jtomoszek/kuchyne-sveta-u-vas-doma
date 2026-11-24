// Jediný zdroj textů, menu, fotek a kontaktů.
// Po úpravě restartujte `npm start` (nebo spusťte `npm run build`).
// Prázdná hodnota ("") = údaj se na webu nezobrazí, případně se v náhledu označí „doplnit“.

export default {
  site: {
    // Pracovní název – jméno a značku potvrdí klientka.
    brand: "Kuchyně světa u vás doma",
    title: "Kuchyně světa u vás doma – osobní šéfkuchařka",
    description:
      "Osobní šéfkuchařka, která vaří u vás doma. Menu inspirovaná kuchyněmi světa, na přání i květiny a výzdoba stolu.",
    lang: "cs",
  },

  // Fotky: ke každé patří výřez pro mobil a pro desktop. `placeholder: true`
  // zobrazí v náhledu štítek „zástupný snímek“; po výměně za vlastní fotku nastavte false.
  hero: {
    heading: "Kuchyně světa u vás doma",
    text: "Řekněte mi, na co máte chuť. Navrhnu menu a přijedu ho uvařit k vám domů. A jestli chcete slavnostně prostřít, s dcerou doladíme stůl květinami.",
    primaryCta: "Naplánovat večeři",
    secondaryCta: "Prohlédnout menu",
    photo: {
      mobile: { src: "photos/hero-mobile.svg", width: 1200, height: 900 },
      desktop: { src: "photos/hero-desktop.svg", width: 1600, height: 2000 },
      alt: "Hotové jídlo na prostřeném domácím stole s květinami",
      placeholder: true,
    },
  },

  menus: {
    heading: "Na co máte chuť?",
    text: "Vyberte si kuchyni, která vás láká. Nebo mi řekněte, co máte rádi, a já navrhnu menu pro vaše hosty.",
    // Další menu přidávejte až z podkladů klientky. `id` se posílá s poptávkou.
    items: [
      {
        id: "provence",
        name: "Večer v Provence",
        text: "Jižní Francie u vašeho stolu. Sezonní zelenina, čerstvé bylinky a menu sestavené pro vás a vaše hosty.",
        cta: "Mám chuť na Provence",
        photo: {
          mobile: { src: "photos/menu-provence-mobile.svg", width: 1200, height: 900 },
          desktop: { src: "photos/menu-provence-desktop.svg", width: 1600, height: 1000 },
          alt: "Jídlo z menu Večer v Provence",
          placeholder: true,
        },
      },
    ],
    // Volba bez konkrétního menu.
    advice: {
      id: "poradit",
      name: "Nechám si poradit",
      text: "Nevíte, kterou kuchyni zvolit? Napište mi, co máte rádi, a menu navrhnu já.",
      cta: "Nechám si poradit",
    },
  },

  flowers: {
    heading: "Večer, ve kterém všechno hraje",
    text: "Jídlo je zážitek. Ale teprve stůl, od kterého se nikomu nechce vstávat, z něj dělá večer. Moje dcera má vlastní květinářství, a pokud si to budete přát, promění místo, kde hostíte, tak, aby ladilo s menu, s příležitostí i s vámi. Já přivezu chutě, ona atmosféru. Vy jen otevřete dveře hostům.",
    photo: {
      mobile: { src: "photos/kvetiny-mobile.svg", width: 1200, height: 1500 },
      desktop: { src: "photos/kvetiny-desktop.svg", width: 1600, height: 1067 },
      alt: "Květinová výzdoba na prostřeném stole",
      placeholder: true,
    },
  },

  steps: {
    heading: "Jak to probíhá",
    items: [
      {
        title: "Řeknete mi, co plánujete.",
        text: "Napište, kdy a kde chcete hostit a kolik vás bude.",
      },
      {
        title: "Společně doladíme menu.",
        text: "Vyberete si kuchyni, nebo vám navrhnu, co by se k vašemu večeru hodilo. Podle přání doladíme i květiny.",
      },
      {
        title: "Přijedu a uvařím u vás.",
        text: "V domluvený den vařím u vás doma. Vy můžete být se svými hosty.",
      },
    ],
  },

  about: {
    heading: "Kdo vám bude vařit",
    text: "Na cestách jsem poznávala svět přes jídlo. Teď tyhle chutě přivážím k vašemu stolu.",
    // Jedna krátká skutečná vzpomínka z cest. Dokud je prázdná, nezobrazuje se.
    memory: "",
    photo: {
      mobile: { src: "photos/portret-mobile.svg", width: 1200, height: 1200 },
      desktop: { src: "photos/portret-desktop.svg", width: 1200, height: 1500 },
      alt: "Šéfkuchařka při vaření",
      placeholder: true,
    },
  },

  form: {
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

  // Patička. Prázdné údaje se v náhledu zobrazí jako „doplnit“.
  contact: {
    name: "",
    email: "",
    phone: "",
    privacyUrl: "",
  },
};
