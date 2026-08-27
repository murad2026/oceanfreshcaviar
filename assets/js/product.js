/* Страница одной позиции: крупная банка, вкус, фасовки,
   путь заказа до двери и отзывы. */
(() => {
  "use strict";

  const SUPPORTED = ["ru", "en"];
  const stored = localStorage.getItem("ofc-lang");
  const guess = (navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  let lang = SUPPORTED.includes(stored) ? stored : guess;

  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;
  const loc = (o) => (o && (o[lang] || o.ru || o.en)) || "";
  const money = (n) => "$" + n.toLocaleString("en-US");
  const P = CONFIG.products.find((x) => x.id === window.PRODUCT_ID);

  const tins = (n) => {
    if (lang !== "ru") return n === 1 ? "tin" : "tins";
    const d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return "банка";
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return "банки";
    return "банок";
  };
  const gramsLabel = (g) =>
    g >= 1000 ? g / 1000 + (lang === "ru" ? " кг" : " kg") : g + (lang === "ru" ? " г" : " g");

  /* ---------- образец зерна ---------- */
  function grainAvatar(p, cls) {
    const g = p.grain;
    if (!g) return "";
    const R = 50, r = Math.max(3, g.mm * 2.1), step = r * 1.86;
    let seed = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    let eggs = "";
    for (let y = -R; y <= R; y += step * 0.88)
      for (let x = -R; x <= R; x += step) {
        const cx = x + (rnd() - 0.5) * step * 0.5 + ((Math.round(y / step) % 2) * step) / 2;
        const cy = y + (rnd() - 0.5) * step * 0.4;
        if (Math.hypot(cx, cy) > R + r * 0.35) continue;
        const rr = r * (0.86 + rnd() * 0.28);
        eggs += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="url(#pg)"/>`;
      }
    return `<span class="avatar-wrap ${cls || ""}">
      <img class="avatar-img" src="../assets/img/${p.id}.jpg" alt="" loading="lazy"
           onload="this.classList.add('is-on')" onerror="this.remove()">
      <svg class="avatar" viewBox="-50 -50 100 100" aria-hidden="true">
        <defs><radialGradient id="pg" cx="34%" cy="30%" r="72%">
          <stop offset="0%" stop-color="${g.light}"/><stop offset="52%" stop-color="${g.base}"/>
          <stop offset="100%" stop-color="#0b0f16"/></radialGradient>
          <clipPath id="pc"><circle cx="0" cy="0" r="50"/></clipPath></defs>
        <g clip-path="url(#pc)"><circle cx="0" cy="0" r="50" fill="#11151d"/>${eggs}</g>
      </svg></span>`;
  }

  /* ---------- страница ---------- */
  function renderProduct() {
    const pf = P.profile || {};
    const rows = P.variants
      .map((v) => {
        const price = v.price
          ? `<span class="size-price">${money(v.price)}</span>
             <small>${money(Math.round((v.price / v.grams) * 100))} ${t("product.per100")}</small>`
          : `<span class="size-price size-ask">${t("product.priceOnRequest")}</span><small>&nbsp;</small>`;
        const tag = v.wholesale
          ? `<em class="size-pre size-wholesale">${t("product.wholesale")}</em>`
          : v.inStock
          ? ""
          : `<em class="size-pre">${t("product.preorder")}</em>`;
        return `<li class="size-row">
          <span class="size-g">${
            v.unit ? `${v.unit}<em class="size-sub">${gramsLabel(v.grams)}${v.pack ? " · " + loc(v.pack) : ""}</em>` : gramsLabel(v.grams)
          }${tag}</span>
          <span class="size-money">${price}</span>
          <a class="size-btn${v.wholesale ? " is-pre" : ""}" href="../?add=${P.id}-${v.grams}#order"
             title="${v.wholesale ? t("product.ask") : v.inStock ? t("product.buy") : t("product.pre")}">+</a>
        </li>`;
      })
      .join("");

    const facts = [
      [t("compare.h.grain"), P.grain ? String(P.grain.mm).replace(".", lang === "ru" ? "," : ".") + " " + t("product.mm") : null],
      [t("compare.h.color"), loc(pf.color)],
      [t("compare.h.taste"), loc(pf.taste)],
      [t("compare.h.best"), loc(pf.best)],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");

    document.getElementById("productPage").innerHTML = `
      <article class="pdp">
        <div class="pdp-visual">
          <div class="pdp-tin">
            <img src="../assets/img/tins/${P.id}.jpg" alt="${loc(P.name)}"
                 onload="this.parentNode.classList.add('is-on')"
                 onerror="this.parentNode.remove()">
          </div>
          ${grainAvatar(P, "pdp-grain")}
        </div>
        <div class="pdp-body">
          <span class="tag tag-pre">${loc(P.badge)}</span>
          <h1>${loc(P.name)}</h1>
          ${loc(P.origin) ? `<p class="card-origin">${loc(P.origin)}</p>` : ""}
          <p class="pdp-desc">${loc(P.description)}</p>
          <dl class="pdp-facts">${facts}</dl>
          <h2 class="pdp-h">${t("page.sizes")}</h2>
          <ul class="sizes">${rows}</ul>
          <p class="pdp-note">${t("page.note")}</p>
        </div>
      </article>`;
  }

  /* ---------- путь заказа ---------- */
  function renderFlow() {
    const steps = [1, 2, 3, 4].map(
      (i) => `<li><span class="flow-n">${i}</span>
          <h3>${t("flow." + i + ".t")}</h3><p>${t("flow." + i + ".d")}</p></li>`
    );
    document.getElementById("deliveryFlow").innerHTML = `
      <section class="flow">
        <h2>${t("flow.title")}</h2>
        <p class="section-lead">${t("flow.lead")}</p>
        <ol class="flow-list">${steps.join("")}</ol>
      </section>`;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.25 }
    );
    document.querySelectorAll(".flow-list li").forEach((el, i) => {
      el.style.transitionDelay = i * 90 + "ms";
      io.observe(el);
    });
  }

  /* ---------- отзывы ---------- */
  function renderReviews() {
    const all = (CONFIG.reviews || []).filter((r) => !r.product || r.product === P.id);
    const host = document.getElementById("reviews");
    if (!all.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = `<section class="reviews">
        <h2>${t("reviews.title")}</h2>
        <p class="section-lead">${t("reviews.lead")}</p>
        <div class="review-grid">${all
          .map(
            (r) => `<figure class="review">
              ${r.photo ? `<img src="../${r.photo}" alt="" loading="lazy">` : ""}
              <figcaption>
                <p>${loc(r.text)}</p>
                <span>${r.author || ""}${r.date ? " · " + r.date : ""}</span>
              </figcaption>
            </figure>`
          )
          .join("")}</div>
      </section>`;
  }

  /* ---------- контакты ---------- */
  function renderContacts() {
    const c = CONFIG.contacts, links = [];
    if (c.phone) links.push(`<a href="https://wa.me/${c.phone}">WhatsApp ${c.phoneDisplay}</a>`);
    if (c.phone) links.push(`<a href="tel:+${c.phone}">${t("contact.call")} ${c.phoneDisplay}</a>`);
    if (c.telegram) links.push(`<a href="https://t.me/${c.telegram}">Telegram @${c.telegram}</a>`);
    if (c.instagram) links.push(`<a href="https://instagram.com/${c.instagram}">Instagram @${c.instagram}</a>`);
    if (c.email) links.push(`<a href="mailto:${c.email}">${c.email}</a>`);
    document.getElementById("footerContacts").innerHTML =
      links.join("") + `<span style="color:var(--muted)">${c.city}</span>`;
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.title = loc(P.name) + " — Ocean Fresh Caviar";
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
    renderProduct();
    renderFlow();
    renderReviews();
    renderContacts();
    localStorage.setItem("ofc-lang", lang);
  }

  document.getElementById("langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    applyLang();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang();
})();
