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
     wholesale: true -> строка помечается как оптовая
     stock: 12 -> в строке появится «осталось 12 банок»
     stock: 0  -> «закончилось», строка уходит в предзаказ
     stock не указан -> остаток не показывается
     ВАЖНО: описания ниже — черновые, проверьте формулировки.
     Появятся оптовые цены за килограмм — проставьте их вместо 0. */
  products: [
    {
      id: "paddlefish",
      category: "black",
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
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "hackleback",
      category: "black",
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
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "kaluga",
      category: "black",
      name: { ru: "Калуга", en: "Kaluga Sturgeon" },
      origin: { ru: "", en: "" },   // TODO: происхождение (ферма, страна)
      badge: { ru: "Крупное зерно", en: "Large grain" },
      description: {
        ru: "Крупное зерно и мягкий сливочный вкус с долгим послевкусием. Калугу часто ставят рядом с белугой — по размеру икринки и характеру она к ней ближе всего.",
        en: "Large grain and a soft, creamy taste with a long finish. Kaluga is often put next to beluga — in grain size and character it is the closest thing to it.",
      },
      variants: [
        { grams: 125,  price: 150, inStock: true },
        { grams: 250,  price: 280, inStock: true },
        { grams: 500,  price: 500, inStock: true },
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "white-sturgeon",
      category: "black",
      name: { ru: "Белый осётр", en: "White Sturgeon" },
      origin: { ru: "ферма, Калифорния, США", en: "farmed, California, USA" },
      badge: { ru: "Из Калифорнии", en: "From California" },
      description: {
        ru: "Американская классика: зерно среднего и крупного размера, чистый ореховый вкус со сливочной ноткой. Выращивается на калифорнийских фермах — путь до Бостона короткий.",
        en: "The American classic: medium to large grain and a clean, nutty flavour with a creamy note. Raised on Californian farms — a short trip to Boston.",
      },
      variants: [
        { grams: 125,  price: 200, inStock: true },
        { grams: 250,  price: 380, inStock: true },
        { grams: 500,  price: 700, inStock: true },
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "siberian",
      category: "black",
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
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "beluga-hybrid",
      category: "black",
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
        { grams: 1000, price: 0,   inStock: false, wholesale: true },
      ],
    },
    {
      id: "velvet",
      category: "black",
      name: { ru: "Бархатная", en: "Velvet" },
      origin: { ru: "импорт", en: "overseas" },
      badge: { ru: "Редкая позиция", en: "Rare" },
      description: {
        ru: "Самая редкая позиция нашего прайса: крупное зерно, бархатистая текстура и сливочный, долгий финиш. Берут, когда повод особенный.",
        en: "The rarest line on our list: large eggs, a velvety texture and a long, creamy finish. For occasions that deserve it.",
      },
      variants: [
        { grams: 125,  price: 300,  inStock: true },
        { grams: 250,  price: 550,  inStock: true },
        { grams: 500,  price: 1000, inStock: true },
        { grams: 1000, price: 0,    inStock: false, wholesale: true },
      ],
    },
  ],

  /* ---------- 5. ОПЛАТА КАРТОЙ ----------
     enabled: true включает кнопку «Оплатить картой» в блоке заказа.
     links — ссылки Stripe Payment Link по ключу «товар-граммы».
     Онлайн-оплата рассчитана на доставку внутри I-495, где она бесплатна;
     за пределами зоны доставку сначала считаем по адресу. */
  payments: {
    enabled: false,
    links: {
      // "paddlefish-125": "https://buy.stripe.com/...",
      // "paddlefish-250": "https://buy.stripe.com/...",
    },
  },

  /* ---------- 6. СЕЗОН ----------
     harvestEnds — дата окончания сбора (ГГГГ-ММ-ДД). Обратный отсчёт
     на сайте считается сам. show: false — блок скрыть. */
  season: {
    show: true,
    harvestEnds: "2026-10-20",
  },

  /* ---------- 7. ДОСТАВКА ---------- */
  delivery: {
    zone: {
      ru: "Внутри кольца I-495 — бесплатно, курьером из рук в руки",
      en: "Inside the I-495 belt — free, by courier, hand to hand",
    },
    days: {
      ru: "До трёх дней, возим в любой день недели",
      en: "Within three days, any day of the week",
    },
    lead: {
      ru: "Отправка в термоупаковке, стоимость считаем по адресу",
      en: "Shipped insulated, cost calculated for your address",
    },
  },
};
