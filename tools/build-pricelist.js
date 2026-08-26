/* Собирает прайс-лист в PDF из assets/js/config.js.
   Запуск:  node tools/build-pricelist.js
   Результат: pricelist/ocean-fresh-caviar-pricelist.pdf          */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright-core");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "pricelist");
const CHROME =
  process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* ---------- данные ---------- */
const ctx = vm.createContext({});
const src = fs.readFileSync(path.join(ROOT, "assets/js/config.js"), "utf8");
const CONFIG = vm.runInContext(src + "\n;CONFIG;", ctx);

const money = (n) => "$" + n.toLocaleString("en-US");
const per100 = (v) => money(Math.round((v.price / v.grams) * 100));
const sizeLabel = (v) =>
  v.unit ? `${v.unit} · ${v.grams} g` : v.grams >= 1000 ? `${v.grams / 1000} kg` : `${v.grams} g`;

const DICT = {
  en: {
    title: "Price list",
    black: "Black caviar",
    red: "Red caviar",
    size: "Size",
    price: "Price",
    unit: "Per 100 g",
    note: "Notes",
    quote: "on request",
    wholesale: "wholesale",
    preorder: "pre-order",
    delivery: "Delivery",
    d1: "Inside the I-495 belt — free, by courier, within three days, any day of the week.",
    d2: "Nationwide — insulated packaging with cold packs, 5 to 10 days depending on the address, weekends and holidays. Cost calculated for your address.",
    season: "Harvest closes 20 October. After that we sell only what we laid down — quantities are limited.",
    updated: "Updated",
  },
  ru: {
    title: "Прайс-лист",
    black: "Чёрная икра",
    red: "Красная икра",
    size: "Фасовка",
    price: "Цена",
    unit: "За 100 г",
    note: "Примечания",
    quote: "по запросу",
    wholesale: "опт",
    preorder: "предзаказ",
    delivery: "Доставка",
    d1: "Внутри кольца I-495 — бесплатно, курьером, до трёх дней, в любой день недели.",
    d2: "По стране — термоупаковка с хладоэлементами, от 5 до 10 дней в зависимости от адреса, выходных и праздников. Стоимость считаем по адресу.",
    season: "Сбор закрывается 20 октября. Дальше продаётся только заложенный запас — количество ограничено.",
    updated: "Обновлено",
  },
};

/* ---------- вёрстка ---------- */
function page(lang) {
  const d = DICT[lang];
  const loc = (o) => (o && (o[lang] || o.en || o.ru)) || "";
  const date = new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const section = (cat) => {
    const items = CONFIG.products.filter((p) => (p.category || "black") === cat);
    if (!items.length) return "";
    const rows = items
      .map((p) => {
        const head = `<tr class="kind">
            <td colspan="4">
              <span class="kind-name">${loc(p.name)}</span>
              ${loc(p.origin) ? `<span class="kind-origin">${loc(p.origin)}</span>` : ""}
              ${p.grain ? `<span class="kind-grain">${String(p.grain.mm).replace(".", lang === "ru" ? "," : ".")} ${lang === "ru" ? "мм" : "mm"}</span>` : ""}
            </td>
          </tr>`;
        const lines = p.variants
          .map((v) => {
            const notes = [];
            if (v.wholesale) notes.push(d.wholesale);
            if (!v.inStock && !v.wholesale) notes.push(d.preorder);
            if (v.pack) notes.push(loc(v.pack));
            return `<tr>
              <td class="sz">${sizeLabel(v)}</td>
              <td class="pr">${v.price ? money(v.price) : d.quote}</td>
              <td class="un">${v.price ? per100(v) : "—"}</td>
              <td class="nt">${notes.join(" · ")}</td>
            </tr>`;
          })
          .join("");
        return head + lines;
      })
      .join("");
    return `<h2>${d[cat]}</h2>
      <table>
        <thead><tr><th>${d.size}</th><th>${d.price}</th><th>${d.unit}</th><th>${d.note}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  };

  const c = CONFIG.contacts;
  return `<section class="sheet">
      <header>
        <div>
          <div class="brand">Ocean Fresh <span>Caviar</span></div>
          <div class="since">${lang === "ru" ? "с 1997 года · Бостон" : "since 1997 · Boston"}</div>
        </div>
        <div class="meta">
          <div class="doc">${d.title}</div>
          <div class="date">${d.updated}: ${date}</div>
        </div>
      </header>

      <p class="season">${d.season}</p>

      ${section("black")}
      ${section("red")}

      <h2 class="dh">${d.delivery}</h2>
      <p class="del">${d.d1}</p>
      <p class="del">${d.d2}</p>

      <footer>
        <span>${c.phoneDisplay} · WhatsApp</span>
        <span>@${c.instagram}</span>
        <span>www.oceanfreshcaviar.com</span>
      </footer>
    </section>`;
}

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 14mm 15mm; }
  *{box-sizing:border-box}
  body{margin:0;font:11pt/1.45 "Helvetica Neue",Arial,sans-serif;color:#1a1c20}
  .sheet{page-break-after:always}
  .sheet:last-child{page-break-after:auto}
  header{display:flex;justify-content:space-between;align-items:flex-end;
    border-bottom:2px solid #b8891f;padding-bottom:10px;margin-bottom:16px}
  .brand{font:600 20pt/1 Georgia,serif;letter-spacing:.01em}
  .brand span{color:#b8891f}
  .since{font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:#7a7f87;margin-top:6px}
  .meta{text-align:right}
  .doc{font:600 12pt/1 Georgia,serif;letter-spacing:.02em}
  .date{font-size:8.5pt;color:#7a7f87;margin-top:5px}
  .season{background:#fbf3e2;border-left:3px solid #b8891f;padding:9px 12px;
    font-size:9.5pt;margin:0 0 16px;color:#4a4335}
  h2{font:600 13pt/1 Georgia,serif;margin:16px 0 8px;color:#1a1c20}
  h2.dh{margin-top:18px}
  table{width:100%;border-collapse:collapse;font-size:10pt}
  thead{display:table-header-group}
  tbody tr{break-inside:avoid;page-break-inside:avoid}
  tr.kind{break-inside:avoid;break-after:avoid;page-break-after:avoid}
  h2{break-after:avoid;page-break-after:avoid}
  thead th{font:600 7.5pt/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;
    color:#8a6a1c;text-align:left;padding:0 8px 5px;border-bottom:1px solid #d8d3c6}
  thead th:nth-child(2),thead th:nth-child(3){text-align:right}
  tbody td{padding:4px 8px;border-bottom:1px solid #eeebe3}
  tr.kind td{padding:9px 8px 4px;border-bottom:1px solid #d8d3c6}
  .kind-name{font:600 11pt Georgia,serif}
  .kind-origin{color:#7a7f87;font-size:8.5pt;margin-left:8px}
  .kind-grain{color:#8a6a1c;font-size:8.5pt;margin-left:8px}
  .sz{width:30%}
  .pr{width:18%;text-align:right;font-weight:600}
  .un{width:18%;text-align:right;color:#7a7f87;font-size:9pt}
  .nt{width:34%;color:#7a7f87;font-size:8.5pt;text-transform:lowercase}
  .del{font-size:9.5pt;color:#3c4048;margin:0 0 6px}
  footer{display:flex;gap:18px;justify-content:space-between;margin-top:22px;break-inside:avoid;
    padding-top:9px;border-top:1px solid #d8d3c6;font-size:9pt;color:#5b5f66}
</style></head><body>${page("en")}${page("ru")}</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const htmlPath = path.join(OUT, "pricelist.html");
  fs.writeFileSync(htmlPath, html);
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const p = await browser.newPage();
  await p.goto("file://" + htmlPath, { waitUntil: "load" });
  await p.pdf({
    path: path.join(OUT, "ocean-fresh-caviar-pricelist.pdf"),
    format: "A4",
    printBackground: true,
  });
  await browser.close();
  console.log("готово: pricelist/ocean-fresh-caviar-pricelist.pdf");
})();
