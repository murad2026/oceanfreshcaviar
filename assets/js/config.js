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
     "sms" | "whatsapp" | "telegram" | "email"
     sms: на телефоне открывается сообщение с готовым текстом заказа.
     На компьютере ссылка sms: обычно не работает — там выручает кнопка
     «Скопировать текст заказа», а когда появится почта, поставьте "email". */
  primaryChannel: "sms",

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
      profile: {
        color: { ru: "стально-серый", en: "steel grey" },
        taste: { ru: "мягкий, чуть землистый, без резкости", en: "soft, faintly earthy, no sharp edge" },
        best:  { ru: "первое знакомство и большие компании", en: "a first taste, and feeding a crowd" },
      },
      grain: { mm: 2.8, base: "#4a5058", light: "#868e97" },
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
      profile: {
        color: { ru: "тёмно-серый, почти чёрный", en: "dark grey, nearly black" },
        taste: { ru: "насыщенный, ореховый, с морской нотой", en: "rich and nutty with a note of the sea" },
        best:  { ru: "тех, кто любит яркий вкус", en: "those who like a bold flavour" },
      },
      grain: { mm: 2.3, base: "#2c2d31", light: "#6a6c72" },
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
      profile: {
        color: { ru: "тёмно-серый с бронзой", en: "dark grey with bronze" },
        taste: { ru: "сливочный, мягкий, с длинным послевкусием", en: "creamy and soft with a long finish" },
        best:  { ru: "повод, когда хочется белугу", en: "when you want beluga, at a fair price" },
      },
      grain: { mm: 3.4, base: "#4c463d", light: "#8d8375" },
      category: "black",
      name: { ru: "Калуга", en: "Kaluga Sturgeon" },
      origin: { ru: "ферма, импорт", en: "farmed, imported" },
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
      profile: {
        color: { ru: "серо-коричневый", en: "grey-brown" },
        taste: { ru: "чистый ореховый со сливочной ноткой", en: "clean and nutty with a creamy note" },
        best:  { ru: "универсальный выбор к столу", en: "an all-round choice for the table" },
      },
      grain: { mm: 3.1, base: "#4f4638", light: "#918570" },
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
      profile: {
        color: { ru: "тёмно-коричневый", en: "dark brown" },
        taste: { ru: "сливочно-ореховый, классический", en: "creamy-nutty, the classic profile" },
        best:  { ru: "тех, кто знает, чего ждёт", en: "people who know what they expect" },
      },
      grain: { mm: 2.9, base: "#3d352c", light: "#7d7263" },
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
      profile: {
        color: { ru: "светло-серый", en: "light grey" },
        taste: { ru: "мягкий, деликатный, сливочный", en: "mild, delicate, buttery" },
        best:  { ru: "подарок и красивую подачу", en: "gifting and a striking presentation" },
      },
      grain: { mm: 3.5, base: "#61605c", light: "#9d9c96" },
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
      profile: {
        color: { ru: "тёмный с отливом", en: "dark with a sheen" },
        taste: { ru: "бархатная текстура, долгий сливочный финиш", en: "velvety texture, a long creamy finish" },
        best:  { ru: "особенный случай", en: "a special occasion" },
      },
      grain: { mm: 3.6, base: "#39393f", light: "#7e7d86" },
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
    {
      id: "chum",
      profile: {
        color: { ru: "янтарно-оранжевый", en: "amber orange" },
        taste: { ru: "чистый, умеренно солёный, без горечи", en: "clean, moderately salted, no bitterness" },
        best:  { ru: "блины, бутерброды, стол на праздник", en: "blini, toast, a holiday table" },
      },
      grain: { mm: 5.5, base: "#d9541f", light: "#f7a066" },
      category: "red",
      name: { ru: "Кета", en: "Chum Salmon" },
      origin: { ru: "ферма, Аляска, США", en: "farmed, Alaska, USA" },
      badge: { ru: "Аляска", en: "Alaska" },
      description: {
        ru: "Ровное янтарное зерно среднего размера и чистый вкус без горечи. Та самая красная икра, которую ждут на столе — к блинам, на бутерброды и в подарок.",
        en: "Even, amber, medium-sized grain and a clean taste with no bitterness. The red caviar people expect on the table — for blini, for toast, for gifting.",
      },
      variants: [
        { grams: 113, unit: "4 oz",  price: 25, inStock: true,
          pack: { ru: "стекло", en: "glass" } },
        { grams: 225, unit: "8 oz",  price: 45, inStock: true },
        { grams: 454, unit: "1 lb",  price: 85, inStock: true,
          pack: { ru: "лоток", en: "tray" } },
      ],
    },
    {
      id: "gold-chum",
      profile: {
        color: { ru: "золотисто-оранжевый", en: "golden orange" },
        taste: { ru: "слабосолёный, тонкая оболочка, тает во рту", en: "lightly salted, soft shell, melts away" },
        best:  { ru: "тех, кто ищет красную икру покрупнее", en: "anyone after larger salmon roe" },
      },
      grain: { mm: 6.2, base: "#e8801f", light: "#ffc078" },
      category: "red",
      name: { ru: "Золотая кета", en: "Gold Chum" },
      origin: { ru: "дикая, Аляска, США", en: "wild, Alaska, USA" },
      badge: { ru: "Крупное зерно", en: "Large eggs" },
      description: {
        ru: "Крупное золотистое зерно, слабый посол и тонкая оболочка — икра лопается легко и тает во рту. Дикий тихоокеанский лосось с Аляски.",
        en: "Large golden eggs, a light cure and a soft shell — they burst easily and melt in the mouth. Wild Pacific salmon from Alaska.",
      },
      variants: [
        { grams: 500, unit: "1.1 lb", price: 100, inStock: true,
          pack: { ru: "лоток", en: "tray" } },
      ],
    },
    {
      id: "pink",
      profile: {
        color: { ru: "светло-оранжевый", en: "light orange" },
        taste: { ru: "мягкий, нежное зерно, негустой посол", en: "mild, tender grain, a light cure" },
        best:  { ru: "повседневный стол", en: "an everyday table" },
      },
      grain: { mm: 4.2, base: "#e2703a", light: "#f9b48c" },
      category: "red",
      name: { ru: "Горбуша", en: "Pink Salmon" },
      origin: { ru: "дикая, Аляска или импорт", en: "wild, Alaska or imported" },
      badge: { ru: "Дикая", en: "Wild" },
      description: {
        ru: "Зерно помельче и понежнее, чем у кеты, вкус мягкий и не солёный. Дикая рыба. Сейчас позиции нет в наличии — оставьте бесплатный предзаказ, сообщим, как появится.",
        en: "Smaller, softer grain than chum and a mild, gently salted taste. Wild fish. Out of stock at the moment — leave a free pre-order and we'll tell you when it lands.",
      },
      variants: [
        { grams: 113, unit: "4 oz", price: 22, inStock: false,
          pack: { ru: "стекло", en: "glass" } },
        { grams: 225, unit: "8 oz", price: 40, inStock: false },
        { grams: 454, unit: "1 lb", price: 75, inStock: false,
          pack: { ru: "лоток", en: "tray" } },
      ],
    },
  ],

  /* ---------- 5. ЧАТ НА САЙТЕ ----------
     Идентификатор сайта в Crisp (Settings -> Website settings -> Setup).
     null — виджет не подключается. Отвечает бот из tools/chat-worker. */
  chat: { crispWebsiteId: "fed75a74-4131-40a6-b96a-36931d910aa5" },

  /* ---------- 6. ОТЗЫВЫ ----------
     Появляются на странице позиции. product — id товара (без него отзыв
     виден у всех позиций), photo — путь к файлу от корня сайта.
     Публикуйте только настоящие отзывы и настоящие фотографии.
       { product: "velvet", photo: "assets/img/reviews/anna.jpg",
         author: "Анна, Бруклайн", date: "12.10.2026",
         text: { ru: "...", en: "..." } },                              */
  reviews: [],

  /* ---------- 7. ОПЛАТА КАРТОЙ ----------
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

  /* ---------- 8. СЕЗОН ----------
     harvestEnds — дата окончания сбора (ГГГГ-ММ-ДД). Обратный отсчёт
     на сайте считается сам. show: false — блок скрыть. */
  season: {
    show: true,
    harvestEnds: "2026-10-20",
  },

  /* ---------- 9. СПОСОБЫ ДОСТАВКИ ----------
     Показываются карточками в блоке заказа и на странице каждой позиции.
     show: false убирает вариант с сайта. */
  shipping: [
    {
      id: "pickup",
      show: true,
      price: { ru: "Бесплатно", en: "Free" },
      time: { ru: "В день заказа", en: "Same day" },
      title: { ru: "Самовывоз", en: "Pickup" },
      text: {
        ru: "Заберёте сами в удобное время. Адрес и часы называем, когда подтверждаем заказ.",  // TODO: район и часы
        en: "Pick it up yourself at a time that suits you. We give the address and hours when we confirm the order.",
      },
    },
    {
      id: "courier",
      show: true,
      price: { ru: "Бесплатно", en: "Free" },
      time: { ru: "До трёх дней", en: "Within three days" },
      title: { ru: "Курьер по I-495", en: "Courier inside I-495" },
      text: {
        ru: "Внутри кольца I-495 везём сами, в термоупаковке, и передаём из рук в руки. В любой день недели.",
        en: "Inside the I-495 belt we drive it ourselves, insulated, and hand it over in person. Any day of the week.",
      },
    },
    {
      id: "ship",
      show: true,
      price: { ru: "По адресу", en: "Quoted" },
      time: { ru: "1–2 дня", en: "1–2 days" },
      title: { ru: "В другие штаты", en: "Other states" },
      text: {
        ru: "Отправляем экспресс-доставкой в термоупаковке с хладоэлементами, по понедельникам–средам, чтобы посылка не лежала в выходные. Стоимость считаем по адресу и весу.",
        en: "Express shipping in an insulated box with cold packs, sent Monday to Wednesday so the parcel never sits out a weekend. Cost calculated from address and weight.",
      },
    },
  ],

  /* ---------- 10. ДОСТАВКА: СПРАВКА В РАЗДЕЛЕ ---------- */
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
      ru: "Экспресс-отправка в термоупаковке, 1–2 дня; отправляем по понедельникам–средам",
      en: "Express shipping, insulated, 1–2 days; sent Monday to Wednesday",
    },
  },
};
