/* Собирает воркер в один файл: tools/chat-worker/worker.bundled.js
   Каталог вшивается прямо в код, чтобы файл можно было вставить в
   редактор Cloudflare через браузер, без установки чего-либо.
   Запуск: node tools/build-worker-bundle.js                        */

const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "chat-worker");
const worker = fs.readFileSync(path.join(dir, "worker.js"), "utf8");
const catalog = fs.readFileSync(path.join(dir, "catalog.json"), "utf8");

const bundled = worker.replace(
  'import catalog from "./catalog.json";',
  "/* каталог вшит при сборке — node tools/build-worker-bundle.js */\nconst catalog = " +
    catalog.trim() +
    ";"
);

const out = path.join(dir, "worker.bundled.js");
fs.writeFileSync(out, bundled);
console.log(
  "готово:",
  path.relative(path.join(__dirname, ".."), out),
  "—",
  Math.round(bundled.length / 1024),
  "КБ"
);
