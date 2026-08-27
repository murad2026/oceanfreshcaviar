(() => {
  "use strict";

  /* ---------- язык ---------- */
  const SUPPORTED = ["ru", "en"];
  const stored = localStorage.getItem("ofc-lang");
  const guess = (navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  let lang = SUPPORTED.includes(stored) ? stored : guess;

  const t = (key) => (I18N[lang] && I18N[lang][key]) || key;
  const loc = (obj) => (obj && (obj[lang] || obj.ru || obj.en)) || "";

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.getElementById("factZone").textContent = loc(CONFIG.delivery.zone);
    document.getElementById("factDays").textContent = loc(CONFIG.delivery.days);
    document.getElementById("factLead").textContent = loc(CONFIG.delivery.lead);
    renderShipping("shippingBox", t, loc);
    const sel = document.getElementById("shippingSelect");
    if (sel) {
      const cur = sel.value;
      sel.innerHTML = (CONFIG.shipping || [])
        .filter((x) => x.show !== false)
        .map((x) => `<option value="${x.id}">${loc(x.title)}</option>`)
        .join("");
      if (cur) sel.value = cur;
    }
    renderSeason();
    renderProducts();
    renderCompare();
    renderCart();
    renderContacts();
    localStorage.setItem("ofc-lang", lang);
  }

  document.getElementById("langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    applyLang();
  });

  /* ---------- вспомогательное ---------- */
  const money = (n) => "$" + n.toLocaleString("en-US");
  const gramsLabel = (g) =>
    g >= 1000 ? g / 1000 + (lang === "ru" ? " кг" : " kg") : g + (lang === "ru" ? " г" : " g");
  const key = (p, v) => p.id + "-" + v.grams;

  const tins = (n) => {
    if (lang !== "ru") return n === 1 ? "tin" : "tins";
    const d = n % 10, h = n % 100;
    if (d === 1 && h !== 11) return "банка";
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return "банки";
    return "банок";
  };

  /* ---------- корзина ---------- */
  const cart = new Map(); // key -> {product, variant, qty}

  function addToCart(product, variant) {
    const k = key(product, variant);
    const item = cart.get(k);
    if (item) item.qty += 1;
    else cart.set(k, { product, variant, qty: 1 });
    if (!variant.inStock) {
      const pre = document.querySelector('input[name="otype"][value="pre"]');
      if (pre) pre.checked = true;
    }
    renderCart();
    renderProducts();
  }

  function changeQty(k, delta) {
    const item = cart.get(k);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart.delete(k);
    renderCart();
    renderProducts();
  }

  const hasUnpriced = () => [...cart.values()].some((i) => !i.variant.price);
  const cartTotal = () => [...cart.values()].reduce((s, i) => s + i.variant.price * i.qty, 0);

  /* ---------- сезон ---------- */
  function renderSeason() {
    const box = document.getElementById("seasonBox");
    const cfg = CONFIG.season || {};
    if (!cfg.show || !cfg.harvestEnds) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const end = new Date(cfg.harvestEnds + "T23:59:59");
    const days = Math.ceil((end - new Date()) / 86400000);
    const num = document.getElementById("seasonDays");
    const label = document.getElementById("seasonDaysLabel");
    if (days > 0) {
      num.textContent = days;
      label.textContent = t("season.left");
    } else {
      num.textContent = "";
      label.textContent = t("season.over");
    }
    box.classList.toggle("is-over", days <= 0);
  }

  /* ---------- рендер товара ---------- */
  const CATEGORIES = ["black", "red"];

  /* Банка: assets/img/tins/<id>.jpg. Нет файла — блок убирает себя сам. */
  function tinPhoto(p) {
    return `<a class="tin-photo" href="caviar/${p.id}.html">
        <img src="assets/img/tins/${p.id}.jpg" alt="${loc(p.name)}"
             onload="this.classList.add('is-on')"
             onerror="this.parentNode.remove()">
      </a>`;
  }

  /* Круглый образец икры: икринки настоящего размера и цвета.
     Раскладка детерминированная — картинка не «прыгает» при перерисовке. */
  function grainAvatar(p) {
    const g = p.grain;
    if (!g) return "";
    /* Если в assets/img/ лежит <id>.jpg — показываем фото, иначе рисованный
       образец. Битая картинка убирает себя сама, образец остаётся под ней. */
    const photo = `<img class="avatar-img" src="assets/img/${p.id}.jpg" alt="${loc(
      p.name
    )}" loading="lazy" onload="this.classList.add('is-on')" onerror="this.remove()">`;
    const R = 50;                       // радиус круга в единицах viewBox
    const r = Math.max(3, g.mm * 2.1);  // радиус икринки: 3 мм -> ~6.3
    const step = r * 1.86;
    let seed = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    let eggs = "";
    for (let y = -R; y <= R; y += step * 0.88) {
      for (let x = -R; x <= R; x += step) {
        const cx = x + (rnd() - 0.5) * step * 0.5 + ((Math.round(y / step) % 2) * step) / 2;
        const cy = y + (rnd() - 0.5) * step * 0.4;
        if (Math.hypot(cx, cy) > R + r * 0.35) continue;
        const rr = r * (0.86 + rnd() * 0.28);
        eggs += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="url(#g-${p.id})"/>`;
      }
    }
    return `<span class="avatar-wrap">${photo}<svg class="avatar" viewBox="-50 -50 100 100" role="img" aria-label="${loc(p.name)}">
        <defs>
          <radialGradient id="g-${p.id}" cx="34%" cy="30%" r="72%">
            <stop offset="0%" stop-color="${g.light}"/>
            <stop offset="52%" stop-color="${g.base}"/>
            <stop offset="100%" stop-color="#0b0f16"/>
          </radialGradient>
          <clipPath id="c-${p.id}"><circle cx="0" cy="0" r="50"/></clipPath>
        </defs>
        <g clip-path="url(#c-${p.id})">
          <circle cx="0" cy="0" r="50" fill="#11151d"/>
          ${eggs}
        </g>
        <circle cx="0" cy="0" r="49" fill="none" stroke="rgba(217,164,65,.35)"/>
      </svg></span>`;
  }

  function cardHtml(p) {
    const rows = p.variants
      .map((v) => {
        const k = key(p, v);
        const inCart = cart.get(k);
        const stock =
          v.stock == null
            ? ""
            : v.stock > 0
            ? `<em class="size-left">${t("product.stock")} ${v.stock} ${tins(v.stock)}</em>`
            : `<em class="size-left is-out">${t("product.soldout")}</em>`;
        const price = v.price
          ? `<span class="size-price">${money(v.price)}</span>
             <small>${money(Math.round((v.price / v.grams) * 100))} ${t("product.per100")}</small>`
          : `<span class="size-price size-ask">${t("product.priceOnRequest")}</span><small>&nbsp;</small>`;
        return `<li class="size-row${inCart ? " is-added" : ""}">
          <span class="size-g">${
            v.unit
              ? `${v.unit}<em class="size-sub">${gramsLabel(v.grams)}${
                  v.pack ? " · " + loc(v.pack) : ""
                }</em>`
              : gramsLabel(v.grams)
          }${
            v.wholesale
              ? `<em class="size-pre size-wholesale">${t("product.wholesale")}</em>`
              : v.inStock || v.stock === 0
              ? ""
              : `<em class="size-pre">${t("product.preorder")}</em>`
          }</span>
          <span class="size-money">${price}${stock}</span>
          <button type="button" class="size-btn${inCart ? " is-on" : ""}${
            v.wholesale ? " is-pre" : ""
          }" data-add="${k}" title="${
            v.wholesale ? t("product.ask") : v.inStock ? t("product.buy") : t("product.pre")
          }">${inCart ? inCart.qty : "+"}</button>
        </li>`;
      })
      .join("");
    const origin = loc(p.origin) ? `<p class="card-origin">${loc(p.origin)}</p>` : "";
    const grain = p.grain
      ? `<p class="card-grain">${t("product.grain")} ${String(p.grain.mm).replace(".", lang === "ru" ? "," : ".")} ${t("product.mm")}</p>`
      : "";
    return `<article class="card">
        ${tinPhoto(p)}
        <div class="card-top">
          ${grainAvatar(p)}
          <div class="card-id">
            <span class="tag tag-pre">${loc(p.badge)}</span>
            <h3><a href="caviar/${p.id}.html">${loc(p.name)}</a></h3>
            ${origin}
            ${grain}
          </div>
        </div>
        <p class="card-desc">${loc(p.description)}</p>
        <ul class="sizes">${rows}</ul>
        <a class="card-more" href="caviar/${p.id}.html">${t("product.more")} →</a>
      </article>`;
  }

  function renderProducts() {
    CONFIG.products.forEach((p) =>
      p.variants.forEach((v) => {
        if (v.stock === 0) v.inStock = false;
      })
    );
    const host = document.getElementById("productList");
    host.innerHTML = CATEGORIES.map((cat) => {
      const items = CONFIG.products.filter((p) => (p.category || "black") === cat);
      const body = items.length
        ? `<div class="cards">${items.map(cardHtml).join("")}</div>`
        : cat === "red"
        ? `<p class="cat-soon">${t("cat.red.soon")}</p>`
        : "";
      if (!body) return "";
      return `<section class="cat">
          <div class="cat-head">
            <h3>${t("cat." + cat)}</h3>
            <p>${t("cat." + cat + ".d")}</p>
          </div>
          ${body}
        </section>`;
    }).join("");

    host.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        for (const p of CONFIG.products)
          for (const v of p.variants)
            if (key(p, v) === btn.dataset.add) addToCart(p, v);
      });
    });
  }

  /* ---------- сравнение ---------- */
  function renderCompare() {
    const rows = CATEGORIES.flatMap((cat) => {
      const items = CONFIG.products.filter((p) => (p.category || "black") === cat);
      if (!items.length) return [];
      return [
        `<tr class="cmp-cat"><th colspan="6">${t("cat." + cat)}</th></tr>`,
        ...items.map((p) => {
          const cheapest = p.variants
            .filter((v) => v.price)
            .sort((a, b) => a.price / a.grams - b.price / b.grams)[0];
          const pr = cheapest
            ? `${money(Math.round((cheapest.price / cheapest.grams) * 100))} <small>${t("product.per100")}</small>`
            : "—";
          const pf = p.profile || {};
          return `<tr>
            <td data-l="${t("compare.h.kind")}">
              <span class="cmp-kind">${grainAvatar(p)}<span>${loc(p.name)}<small>${loc(p.origin)}</small></span></span>
            </td>
            <td data-l="${t("compare.h.grain")}" class="cmp-num">${
              p.grain ? String(p.grain.mm).replace(".", lang === "ru" ? "," : ".") + " " + t("product.mm") : "—"
            }</td>
            <td data-l="${t("compare.h.color")}">${loc(pf.color)}</td>
            <td data-l="${t("compare.h.taste")}">${loc(pf.taste)}</td>
            <td data-l="${t("compare.h.best")}">${loc(pf.best)}</td>
            <td data-l="${t("compare.h.price")}" class="cmp-num">${pr}</td>
          </tr>`;
        }),
      ];
    });
    document.getElementById("compareTable").innerHTML =
      `<thead><tr>
         <th>${t("compare.h.kind")}</th><th>${t("compare.h.grain")}</th>
         <th>${t("compare.h.color")}</th><th>${t("compare.h.taste")}</th>
         <th>${t("compare.h.best")}</th><th>${t("compare.h.price")}</th>
       </tr></thead><tbody>${rows.join("")}</tbody>`;
  }

  /* ---------- рендер корзины ---------- */
  function renderCart() {
    const list = document.getElementById("cartList");
    const total = document.getElementById("cartTotal");
    if (!cart.size) {
      list.innerHTML = `<p class="cart-empty">${t("order.empty")}</p>`;
      total.textContent = "—";
      renderPay();
      return;
    }
    list.innerHTML = [...cart.entries()]
      .map(([k, i]) => `<div class="cart-row">
          <div class="cart-name">${loc(i.product.name)} · ${gramsLabel(i.variant.grams)}
            <small>${
              i.variant.wholesale
                ? t("product.wholesale") + " · " + t("product.priceOnRequest").toLowerCase()
                : i.variant.inStock
                ? t("product.instock")
                : t("product.preorder")
            }</small></div>
          <div class="qty">
            <button type="button" data-q="-1" data-k="${k}" aria-label="−">−</button>
            <span>${i.qty}</span>
            <button type="button" data-q="1" data-k="${k}" aria-label="+">+</button>
          </div>
          <div class="cart-sum">${i.variant.price ? money(i.variant.price * i.qty) : "—"}</div>
        </div>`)
      .join("");
    list.querySelectorAll("[data-q]").forEach((b) =>
      b.addEventListener("click", () => changeQty(b.dataset.k, Number(b.dataset.q)))
    );
    const sum = cartTotal();
    total.textContent = !hasUnpriced()
      ? money(sum)
      : sum
      ? money(sum) + " + " + t("product.priceOnRequest").toLowerCase()
      : t("product.priceOnRequest");
    renderPay();
  }

  /* ---------- оплата картой ---------- */
  function renderPay() {
    const btn = document.getElementById("payBtn");
    const hint = document.getElementById("payHint");
    const cfg = CONFIG.payments || {};
    if (!cfg.enabled || !cart.size) {
      btn.hidden = true;
      hint.hidden = true;
      return;
    }
    const items = [...cart.entries()];
    const link = items.length === 1 ? (cfg.links || {})[items[0][0]] : null;
    if (link) {
      btn.href = link;
      btn.hidden = false;
      hint.textContent = t("order.payHint");
    } else {
      btn.hidden = true;
      hint.textContent = t("order.payMulti");
    }
    hint.hidden = false;
  }

  /* ---------- текст заказа ---------- */
  function buildMessage() {
    const f = document.getElementById("orderForm");
    const d = new FormData(f);
    const type = d.get("otype") === "pre" ? t("order.type.pre") : t("order.type.buy");
    const lines = [];
    lines.push(lang === "ru" ? "Заказ с сайта oceanfreshcaviar.com" : "Order from oceanfreshcaviar.com");
    lines.push("");
    lines.push(`${t("order.type")}: ${type}`);
    if (cart.size) {
      lines.push("");
      lines.push(t("order.items") + ":");
      cart.forEach((i) =>
        lines.push(`• ${loc(i.product.name)} ${gramsLabel(i.variant.grams)} × ${i.qty}` +
          (i.variant.price ? ` — ${money(i.variant.price * i.qty)}` : ` — ${t("product.priceOnRequest").toLowerCase()}`))
      );
      if (!hasUnpriced()) lines.push(`${t("order.total")}: ${money(cartTotal())}`);
    }
    lines.push("");
    lines.push(`${t("order.name")}: ${d.get("name")}`);
    lines.push(`${t("order.phone")}: ${d.get("phone")}`);
    lines.push(`${t("order.contact")}: ${d.get("channel")}`);
    if (d.get("shipping")) {
      const sh = (CONFIG.shipping || []).find((x) => x.id === d.get("shipping"));
      if (sh) lines.push(`${t("order.how")}: ${loc(sh.title)}`);
    }
    if (d.get("date")) lines.push(`${t("order.date")}: ${d.get("date")}`);
    if (d.get("address")) lines.push(`${t("order.address")}: ${d.get("address")}`);
    if (d.get("comment")) lines.push(`${t("order.comment")}: ${d.get("comment")}`);
    return lines.join("\n");
  }

  function validate() {
    const f = document.getElementById("orderForm");
    const err = document.getElementById("formError");
    const ok = f.name.value.trim() && f.phone.value.trim();
    err.hidden = !!ok;
    if (!ok) {
      err.textContent = t("order.required");
      (f.name.value.trim() ? f.phone : f.name).focus();
    }
    return !!ok;
  }

  function sendLink(text) {
    const c = CONFIG.contacts;
    const enc = encodeURIComponent(text);
    if (CONFIG.primaryChannel === "telegram" && c.telegram) return `https://t.me/${c.telegram}?text=${enc}`;
    if (CONFIG.primaryChannel === "email" && c.email)
      return `mailto:${c.email}?subject=${encodeURIComponent("Order — Ocean Fresh Caviar")}&body=${enc}`;
    return `https://wa.me/${c.phone}?text=${enc}`;
  }

  document.getElementById("orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.open(sendLink(buildMessage()), "_blank", "noopener");
  });

  document.getElementById("copyBtn").addEventListener("click", async (e) => {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(buildMessage());
      const b = e.currentTarget, old = b.textContent;
      b.textContent = t("order.copied");
      setTimeout(() => (b.textContent = old), 1800);
    } catch {
      window.prompt(t("order.copy"), buildMessage());
    }
  });

  /* ---------- контакты ---------- */
  function renderContacts() {
    const c = CONFIG.contacts;
    const links = [];
    if (c.phone) links.push(`<a href="https://wa.me/${c.phone}">WhatsApp ${c.phoneDisplay}</a>`);
    if (c.phone) links.push(`<a href="sms:+${c.phone}">${t("contact.sms")} ${c.phoneDisplay}</a>`);
    if (c.telegram) links.push(`<a href="https://t.me/${c.telegram}">Telegram @${c.telegram}</a>`);
    if (c.instagram) links.push(`<a href="https://instagram.com/${c.instagram}">Instagram @${c.instagram}</a>`);
    if (c.email) links.push(`<a href="mailto:${c.email}">${c.email}</a>`);
    document.getElementById("footerContacts").innerHTML =
      links.join("") +
      `<span class="text-only">${t("contact.textOnly")}</span>` +
      `<span style="color:var(--muted)">${c.city}</span>`;
    document.getElementById("altLinks").innerHTML = links.slice(0, 3).join(" ");
  }

  /* ---------- заказ по ссылке ?add=id-граммы ---------- */
  function addFromUrl() {
    const key0 = new URLSearchParams(location.search).get("add");
    if (!key0) return;
    for (const p of CONFIG.products)
      for (const v of p.variants) if (key(p, v) === key0) addToCart(p, v);
    history.replaceState(null, "", location.pathname + location.hash);
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- старт ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("placeholderNotice").hidden = !CONFIG.pricesArePlaceholder;
  applyLang();
  addFromUrl();
})();
