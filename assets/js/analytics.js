/* Счётчики посещаемости. Каждый грузится, только если в конфиге задан его
   идентификатор; не задан — ни одного запроса наружу не уходит.

   Cloudflare Web Analytics: посещаемость, страницы, источники переходов.
   Кук не ставит и между сайтами не следит, поэтому баннер о согласии
   для него не нужен.

   Google Analytics 4: воронки, события и конверсии — то, чего Cloudflare
   не умеет. Ставит куки, и для посетителей из ЕС это формально требует
   согласия; для торговли внутри США обычно обходятся без баннера.

   Оба идентификатора не секретны: они открыто лежат в исходном коде
   любой страницы, где стоит счётчик, и годятся только для приёма
   статистики.                                                          */
(() => {
  if (window.OFC_MUTED) return;
  const cfg = (typeof CONFIG !== "undefined" && CONFIG.analytics) || {};

  if (cfg.cloudflare) {
    const s = document.createElement("script");
    /* Cloudflare отдаёт маячок как модуль — так же, как в их сниппете.
       Модули и так откладываются до разбора страницы, defer тут лишний. */
    s.type = "module";
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: cfg.cloudflare }));
    document.head.appendChild(s);
  }

  if (cfg.ga4) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4);
    document.head.appendChild(s);

    /* gtag кладёт аргументы в dataLayer как есть: именно arguments, не
       массив, — библиотека потом читает их по позициям. */
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4);
  }
})();
