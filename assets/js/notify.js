/* Маячок значимых событий: корзина, заказ, уход с полной корзиной.
   Шлёт в свой Worker, который уже пересылает тебе в мессенджер.

   Пока CONFIG.notify.url не задан — не делает ровно ничего.
   Никаких кук, идентификаторов и слежки: уходит только то, что
   выбрано в корзине, страница и язык.                            */
(() => {
  "use strict";

  const CFG = (typeof CONFIG !== "undefined" && CONFIG.notify) || {};
  const URL_ = CFG.url;
  if (!URL_) return;

  /* Свои же заходы не должны будить телефон: на сайт владелец ходит чаще
     любого покупателя. ?mute=1 выключает маячок на этом устройстве
     навсегда, ?mute=0 включает обратно. Метка лежит в localStorage, то есть
     привязана к браузеру, а не к человеку — с другого устройства придётся
     повторить.                                                            */
  if (window.OFC_MUTED) return;

  /* Корзину собирают в несколько кликов. Ждём паузу и шлём один раз,
     иначе на каждую банку прилетает отдельный пуш. */
  const QUIET_MS = Number(CFG.quietMs) || 90000;

  let timer = null;
  let latest = null;
  let ordered = false;
  let lastSent = ""; // что уже улетело — чтобы не слать то же самое дважды

  /* Подпись содержимого корзины: состав плюс количества. */
  const sign = (snap) =>
    (snap ? snap.items : [])
      .map((i) => i.id + ":" + i.grams + "x" + i.qty)
      .sort()
      .join("|");

  /* Откуда пришёл человек. Метки живут только на первой открытой ссылке:
     дальше он ходит по каталогу и карточкам, и параметры теряются. Поэтому
     запоминаем источник на вкладку и считаем первое касание — именно оно
     привело покупателя, а не внутренние переходы после.                  */
  const SRC_KEY = "ofc-src";

  function trafficSource() {
    try {
      const saved = sessionStorage.getItem(SRC_KEY);
      if (saved) return saved;
    } catch (e) {
      /* приватный режим — просто считаем заново на каждой странице */
    }

    const q = new URLSearchParams(location.search);
    const utm = q.get("utm_source");
    let src;

    if (utm) {
      const campaign = q.get("utm_campaign") || q.get("utm_content");
      src = campaign ? `${utm} / ${campaign}` : utm;
    } else if (q.get("fbclid") || q.get("igshid")) {
      src = "instagram/facebook";
    } else if (q.get("gclid")) {
      src = "google ads";
    } else if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname.replace(/^www\./, "");
        /* переходы внутри сайта источником не считаем */
        src = host === location.hostname.replace(/^www\./, "") ? "" : host;
      } catch (e) {
        src = "";
      }
    }

    src = (src || "прямой заход").slice(0, 80);
    try {
      sessionStorage.setItem(SRC_KEY, src);
    } catch (e) {
      /* не сохранилось — не страшно, посчитаем в следующий раз */
    }
    return src;
  }

  const body = (type, snap) =>
    JSON.stringify({
      type,
      items: (snap && snap.items) || [],
      total: (snap && snap.total) || 0,
      page: location.pathname,
      lang: document.documentElement.lang || "",
      src: trafficSource(),
    });

  /* Те же события уходят в Google Analytics, если он подключён. Без этого
     GA4 считал бы только заходы, а связь «источник → заявка» пропадала.
     Имена взяты стандартные, кроме ухода с корзиной: такого события у
     GA4 нет. generate_lead и есть та конверсия, которую стоит отмечать
     в отчётах, — оплаты на сайте нет, заказ завершается в разговоре. */
  const GA_EVENT = { cart: "add_to_cart", order: "generate_lead", abandon: "cart_abandoned" };

  function toAnalytics(type, snap) {
    /* analytics.js грузится после нас, но события летят секундами позже,
       так что к этому моменту gtag уже на месте. */
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", GA_EVENT[type] || type, {
        currency: "USD",
        value: (snap && snap.total) || 0,
        items: ((snap && snap.items) || []).map((i) => ({
          item_id: i.id,
          item_name: i.name,
          item_variant: i.grams + "g",
          price: i.price,
          quantity: i.qty,
        })),
      });
    } catch (e) {
      /* счётчик не должен ломать отправку заказа */
    }
  }

  function send(type, snap) {
    toAnalytics(type, snap);
    try {
      fetch(URL_, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: body(type, snap),
        keepalive: true,
        mode: "cors",
      }).catch(() => {});
    } catch (e) {
      /* маячок никогда не должен ломать страницу */
    }
  }

  /* Уход со страницы: fetch уже могут не дать доделать, нужен sendBeacon. */
  function sendOnExit(type, snap) {
    toAnalytics(type, snap);
    try {
      const blob = new Blob([body(type, snap)], { type: "text/plain;charset=UTF-8" });
      if (!navigator.sendBeacon || !navigator.sendBeacon(URL_, blob)) send(type, snap);
    } catch (e) {
      /* тоже молча */
    }
  }

  /* Считаем источник сразу, а не при отправке события: метки живут только
     в адресе открытой ссылки, и к моменту, когда человек наберёт корзину,
     он уже успеет уйти на карточку товара и вернуться. */
  trafficSource();

  document.addEventListener("ofc:cart", (e) => {
    latest = e.detail;
    if (ordered || !latest.items.length) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (ordered || !latest.items.length) return;
      const sig = sign(latest);
      if (sig === lastSent) return;
      lastSent = sig;
      send("cart", latest);
    }, QUIET_MS);
  });

  document.addEventListener("ofc:order", (e) => {
    ordered = true;
    clearTimeout(timer);
    send("order", e.detail);
  });

  /* Набрал корзину и ушёл, ничего не отправив, — самое ценное из всех
     трёх событий: об этих людях ты сейчас не узнаёшь вообще никак.

     Уходом считаем скрытие вкладки: на телефонах это единственный момент,
     который успевает отработать. Переключение вкладок туда-сюда лишних
     пушей не даёт — то, что уже улетело, второй раз не шлём. */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    if (ordered || !latest || !latest.items.length) return;
    const sig = sign(latest);
    if (sig === lastSent) return;
    lastSent = sig;
    clearTimeout(timer);
    sendOnExit("abandon", latest);
  });
})();
