/* Подключение чата Crisp. Пока идентификатор не задан в конфиге,
   виджет не грузится и на странице ничего не появляется. */
(() => {
  const id = (CONFIG.chat || {}).crispWebsiteId;
  if (!id) return;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = id;
  const s = document.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = true;
  document.head.appendChild(s);
})();
