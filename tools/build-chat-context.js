/* Готовит каталог для чат-бота: tools/chat-worker/catalog.json
   Запуск: node tools/build-chat-context.js
   Гонять после каждой правки цен, наличия или условий доставки. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ctx = vm.createContext({});
const CONFIG = vm.runInContext(
  fs.readFileSync(path.join(ROOT, "assets/js/config.js"), "utf8") + "\n;CONFIG;",
  ctx
);

const en = (o) => (o && (o.en || o.ru)) || "";

const catalog = {
  updated: new Date().toISOString().slice(0, 10),
  season: CONFIG.season,
  contacts: {
    phone: CONFIG.contacts.phoneDisplay,
    instagram: CONFIG.contacts.instagram,
    email: CONFIG.contacts.email,
    city: CONFIG.contacts.city,
  },
  shipping: (CONFIG.shipping || [])
    .filter((s) => s.show !== false)
    .map((s) => ({
      id: s.id,
      title: en(s.title),
      price: en(s.price),
      time: en(s.time),
      details: en(s.text),
    })),
  products: CONFIG.products.map((p) => ({
    id: p.id,
    name: en(p.name),
    category: p.category || "black",
    origin: en(p.origin),
    grain_mm: p.grain ? p.grain.mm : null,
    taste: p.profile ? en(p.profile.taste) : "",
    colour: p.profile ? en(p.profile.color) : "",
    good_for: p.profile ? en(p.profile.best) : "",
    description: en(p.description),
    sizes: p.variants.map((v) => ({
      key: `${p.id}-${v.grams}`,
      label: v.unit ? `${v.unit} (${v.grams} g)` : `${v.grams} g`,
      grams: v.grams,
      price_usd: v.price || null,
      per_100g_usd: v.price ? Math.round((v.price / v.grams) * 100) : null,
      in_stock: v.inStock !== false,
      wholesale: !!v.wholesale,
      stock_left: v.stock == null ? null : v.stock,
    })),
  })),
};

const out = path.join(__dirname, "chat-worker/catalog.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(catalog, null, 2));
console.log("каталог для бота собран:", path.relative(ROOT, out), "—", catalog.products.length, "позиций");
