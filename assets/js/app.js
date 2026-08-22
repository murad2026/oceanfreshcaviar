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
    renderProducts();
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

  /* ---------- рендер товара ---------- */
  function renderProducts() {
    const host = document.getElementById("productList");
    host.innerHTML = CONFIG.products
      .map((p) => {
        const rows = p.variants
          .map((v) => {
            const k = key(p, v);
            const inCart = cart.get(k);
            const price = v.price
              ? `<span class="size-price">${money(v.price)}</span>
                 <small>${money(Math.round((v.price / v.grams) * 100))} ${t("product.per100")}</small>`
              : `<span class="size-price size-ask">${t("product.priceOnRequest")}</span><small>&nbsp;</small>`;
            const label = inCart
              ? inCart.qty
              : v.inStock
              ? "+"
              : "+";
            return `<li class="size-row${inCart ? " is-added" : ""}">
              <span class="size-g">${gramsLabel(v.grams)}${
                v.inStock ? "" : `<em class="size-pre">${t("product.preorder")}</em>`
              }</span>
              <span class="size-money">${price}</span>
              <button type="button" class="size-btn${inCart ? " is-on" : ""}${
                v.inStock ? "" : " is-pre"
              }" data-add="${k}" title="${v.inStock ? t("product.buy") : t("product.pre")}">${label}</button>
            </li>`;
          })
          .join("");
        return `<article class="card">
            <span class="tag tag-pre">${loc(p.badge)}</span>
            <h3>${loc(p.name)}</h3>
            <p class="card-origin">${loc(p.origin)}</p>
            <p class="card-desc">${loc(p.description)}</p>
            <ul class="sizes">${rows}</ul>
          </article>`;
      })
      .join("");

    host.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        for (const p of CONFIG.products)
          for (const v of p.variants)
            if (key(p, v) === btn.dataset.add) addToCart(p, v);
      });
    });
  }

  /* ---------- рендер корзины ---------- */
  function renderCart() {
    const list = document.getElementById("cartList");
    const total = document.getElementById("cartTotal");
    if (!cart.size) {
      list.innerHTML = `<p class="cart-empty">${t("order.empty")}</p>`;
      total.textContent = "—";
      return;
    }
    list.innerHTML = [...cart.entries()]
      .map(([k, i]) => `<div class="cart-row">
          <div class="cart-name">${loc(i.product.name)} · ${gramsLabel(i.variant.grams)}
            <small>${i.variant.inStock ? t("product.instock") : t("product.preorder")}</small></div>
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
    if (c.phone) links.push(`<a href="tel:+${c.phone}">${t("contact.call")} ${c.phoneDisplay}</a>`);
    if (c.telegram) links.push(`<a href="https://t.me/${c.telegram}">Telegram @${c.telegram}</a>`);
    if (c.instagram) links.push(`<a href="https://instagram.com/${c.instagram}">Instagram @${c.instagram}</a>`);
    if (c.email) links.push(`<a href="mailto:${c.email}">${c.email}</a>`);
    document.getElementById("footerContacts").innerHTML =
      links.join("") + `<span style="color:var(--muted)">${c.city}</span>`;
    document.getElementById("altLinks").innerHTML = links.slice(0, 3).join(" ");
  }

  /* ---------- старт ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("placeholderNotice").hidden = !CONFIG.pricesArePlaceholder;
  applyLang();
})();
