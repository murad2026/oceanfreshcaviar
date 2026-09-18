/* Cloudflare Web Analytics. Пока токен не задан в конфиге, скрипт не
   грузится и ни одного запроса наружу не уходит.

   Считает посещаемость, страницы и источники переходов. Кук не ставит и
   посетителей между сайтами не отслеживает — поэтому баннер о согласии
   для него не нужен.

   Токен не секрет: он открыто лежит в исходном коде любой страницы,
   где стоит эта аналитика, и годится только для приёма статистики. */
(() => {
  const token = ((typeof CONFIG !== "undefined" && CONFIG.analytics) || {}).cloudflare;
  if (!token) return;
  const s = document.createElement("script");
  /* Cloudflare отдаёт маячок как модуль — так же, как в их сниппете.
     Модули и так откладываются до разбора страницы, defer тут лишний. */
  s.type = "module";
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token }));
  document.head.appendChild(s);
})();
