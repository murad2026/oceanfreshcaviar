/* Собирает sitemap.xml из того же config.js, что и сайт.
   Запуск: node tools/build-sitemap.js                        */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SITE = "https://www.oceanfreshcaviar.com";

const ctx = vm.createContext({});
const CONFIG = vm.runInContext(
  fs.readFileSync(path.join(ROOT, "assets/js/config.js"), "utf8") + "\n;CONFIG;",
  ctx
);

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/pricelist/pricelist.html", priority: "0.6", changefreq: "monthly" },
  ...CONFIG.products.map((p) => ({
    loc: `/caviar/${p.id}.html`,
    priority: "0.8",
    changefreq: "weekly",
  })),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${SITE}${u.loc}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>\n`
    )
    .join("") +
  `</urlset>\n`;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${urls.length} адресов`);
