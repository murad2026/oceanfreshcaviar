/* =============================================================
   OCEAN FRESH CAVIAR — ЕДИНЫЙ ФАЙЛ НАСТРОЕК
   Здесь меняются цены, наличие и контакты. Больше нигде.
   Правка -> сохранить -> закоммитить -> сайт обновился.
   ============================================================= */

const CONFIG = {

  /* ---------- 1. КОНТАКТЫ ---------- */
  contacts: {
    phone: "16173724119",              // он же WhatsApp, только цифры
    phoneDisplay: "+1 (617) 372-4119",
    telegram: null,                    // юзернейм без @, null — блок скрыт
    email: null,                       // почта, null — блок скрыт
    instagram: "oceanfreshcaviar",
    city: "Boston, MA",
  },

  /* ---------- 2. КУДА УХОДИТ ЗАКАЗ ----------
     "whatsapp" | "telegram" | "email" */
  primaryChannel: "whatsapp",

  /* ---------- 3. ПРЕДУПРЕЖДЕНИЕ О ЦЕНАХ ----------
     true — вверху висит жёлтая плашка «цены временные». */
  pricesArePlaceholder: false,

  /* ---------- 4. КАТАЛОГ ----------
     price: 0  -> на сайте «Цена по запросу»
     inStock: true  -> кнопка «Купить»
     inStock: false -> кнопка «Предзаказ бесплатно»
     ВАЖНО: описания ниже — черновые, проверьте формулировки.
     Цену за 1 кг проставьте, пока стоит 0. */
  products: [
    {
      id: "paddlefish",
      name: { ru: "Паддлфиш", en: "Paddlefish" },
      origin: { ru: "ферма, Теннесси, США", en: "farmed, Tennessee, USA" },
      badge: { ru: "Мягкий вход", en: "Entry level" },
      description: {
        ru: "Ровное серо-стальное зерно среднего размера и мягкий вкус без резкости. Самый спокойный способ познакомиться с чёрной икрой и удачный выбор, когда икры нужно много.",
        en: "Even, medium, steel-grey grain and a soft flavour with no sharp edge. The gentlest introduction to black caviar, and the sensible pick when you need volume.",
      },
      variants: [
        { grams: 125,  price: 100, inStock: true },
        { grams: 250,  price: 180, inStock: true },
        { grams: 500,  price: 350, inStock: true },
        { grams: 1000, price: 0,   inStock: false },
      ],
    },
    {
      id: "hackleback",
      name: { ru: "Хаклбэк", en: "Hackleback" },
      origin: { ru: "дикая, США", en: "wild, USA" },
      badge: { ru: "Дикая американская", en: "Wild American" },
      description: {
        ru: "Мелкое тёмное зерно и насыщенный, чуть ореховый вкус. Дикая американская рыба — характер заметно ярче, чем у фермерской икры.",
        en: "Small dark grain and a rich, faintly nutty flavour. Wild American fish, with noticeably more character than farmed roe.",
      },
      variants: [
        { grams: 125,  price: 125, inStock: true },
        { grams: 250,  price: 240, inStock: true },
        { grams: 500,  price: 450, inStock: true },
        { grams: 1000, price: 0,   inStock: false },
      ],
    },
    {
      id: "siberian",
      name: { ru: "Сибирский осётр", en: "Siberian Sturgeon" },
      origin: { ru: "импорт", en: "overseas" },
      badge: { ru: "Классика премиум", en: "Classic premium" },
      description: {
        ru: "Та самая классика осетровой икры: крепкое зерно среднего размера, сливочно-ореховый вкус и долгое послевкусие. Беспроигрышный выбор для стола.",
        en: "The classic sturgeon profile: firm medium grain, a creamy-nutty taste and a long finish. The safe choice for a table you want to impress.",
      },
      variants: [
        { grams: 125,  price: 240, inStock: true },
        { grams: 250,  price: 430, inStock: true },
        { grams: 500,  price: 800, inStock: true },
        { grams: 1000, price: 0,   inStock: false },
      ],
    },
    {
      id: "beluga-hybrid",
      name: { ru: "Белуга-гибрид", en: "Beluga Hybrid" },
      origin: { ru: "ферма, Флорида, США", en: "farmed, Florida, USA" },
      badge: { ru: "Крупное зерно", en: "Large grain" },
      description: {
        ru: "Крупное зерно и мягкий сливочный вкус — профиль, близкий к белуге, но выращенный на ферме во Флориде и заметно доступнее по цене.",
        en: "Large grain and a soft, buttery taste — a beluga-like profile, farmed in Florida and markedly easier on the wallet.",
      },
      variants: [
        { grams: 125,  price: 240, inStock: true },
        { grams: 250,  price: 430, inStock: true },
        { grams: 500,  price: 800, inStock: true },
        { grams: 1000, price: 0,   inStock: false },
      ],
    },
    {
      id: "velvet",
      name: { ru: "Бархатная", en: "Velvet" },
      origin: { ru: "импорт", en: "overseas" },
      badge: { ru: "Редкая позиция", en: "Rare" },
      description: {
        ru: "Редкая позиция нашего прайса: бархатистая текстура, плотное зерно и сливочный, долгий финиш. Берут, когда повод особенный.",
        en: "The rarest line on our list: a velvety texture, dense grain and a long, creamy finish. For occasions that deserve it.",
      },
      variants: [
        { grams: 125,  price: 350,  inStock: true },
        { grams: 250,  price: 600,  inStock: true },
        { grams: 500,  price: 1000, inStock: true },
        { grams: 1000, price: 0,    inStock: false },
      ],
    },
  ],

  /* ---------- 5. ДОСТАВКА ---------- */
  delivery: {
    zone: {
      ru: "Бостон и ближайшие пригороды",   // TODO: уточнить список городов
      en: "Boston and nearby suburbs",
    },
    days: {
      ru: "TODO: дни и часы доставки",
      en: "TODO: delivery days and hours",
    },
    lead: {
      ru: "TODO: за сколько принимаем заказ (например, за 24 часа)",
      en: "TODO: order lead time (e.g. 24 hours)",
    },
  },
};
