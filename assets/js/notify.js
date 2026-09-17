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

  const body = (type, snap) =>
    JSON.stringify({
      type,
      items: (snap && snap.items) || [],
      total: (snap && snap.total) || 0,
      page: location.pathname,
      lang: document.documentElement.lang || "",
    });

  function send(type, snap) {
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
    try {
      const blob = new Blob([body(type, snap)], { type: "text/plain;charset=UTF-8" });
      if (!navigator.sendBeacon || !navigator.sendBeacon(URL_, blob)) send(type, snap);
    } catch (e) {
      /* тоже молча */
    }
  }

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
