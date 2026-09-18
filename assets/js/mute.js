/* Свои заходы не должны попадать ни в уведомления, ни в статистику: на сайт
   владелец ходит чаще любого покупателя, и при небольшом трафике его визиты
   перекашивают все цифры.

   Открыть сайт с ?mute=1 — выключить на этом устройстве навсегда,
   с ?mute=0 — включить обратно.

   Метка живёт в localStorage, то есть привязана к браузеру, а не к человеку:
   с телефона и с компьютера надо сделать по разу. Подключается первым, до
   маячка и аналитики, чтобы они успели её увидеть. */
(() => {
  const KEY = "ofc-notify-mute";
  try {
    const wanted = new URLSearchParams(location.search).get("mute");
    if (wanted === "1" || wanted === "0") {
      if (wanted === "1") localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
      console.log(
        wanted === "1"
          ? "Ocean Fresh: этот браузер исключён из уведомлений и статистики"
          : "Ocean Fresh: этот браузер снова учитывается"
      );
    }
    window.OFC_MUTED = localStorage.getItem(KEY) === "1";
  } catch (e) {
    /* приватный режим или запрещённое хранилище — считаем как обычного гостя */
    window.OFC_MUTED = false;
  }
})();
