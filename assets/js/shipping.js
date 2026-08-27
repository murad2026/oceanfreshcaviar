/* Карточки со способами доставки. Один блок — и в заказе, и на странице позиции. */
function renderShipping(hostId, t, loc, prefix) {
  const host = document.getElementById(hostId);
  if (!host) return;
  const list = (CONFIG.shipping || []).filter((s) => s.show !== false);
  if (!list.length) {
    host.innerHTML = "";
    return;
  }
  const icon = {
    pickup: '<path d="M4 9h16v11H4z"/><path d="M9 9V5h6v4"/>',
    courier: '<path d="M2 15h11V7H2z"/><path d="M13 10h4l4 4v1h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    ship: '<path d="M3 8h13v9H3z"/><path d="M16 11h3l2 3v3h-5z"/><path d="M6 4h7v4H6z"/>',
  };
  host.innerHTML = `<section class="ship">
      <h2>${t("ship.title")}</h2>
      <div class="ship-grid">${list
        .map(
          (s) => `<article class="ship-card">
            <svg viewBox="0 0 24 24" class="ship-ico" fill="none" stroke="currentColor"
                 stroke-width="1.3" stroke-linejoin="round">${icon[s.id] || icon.ship}</svg>
            <h3>${loc(s.title)}</h3>
            <p class="ship-meta"><span>${loc(s.price)}</span><i>·</i><span>${loc(s.time)}</span></p>
            <p class="ship-text">${loc(s.text)}</p>
          </article>`
        )
        .join("")}</div>
      <p class="ship-note">${t("ship.note")}</p>
    </section>`;
}
