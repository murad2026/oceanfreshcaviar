# Чат-бот Ocean Fresh Caviar

Виджет **Crisp** на сайте + бот на Claude в Cloudflare Worker. Бот отвечает
на вопросы по каталогу, помогает выбрать икру, собирает заказ и присылает его
владельцу. Переписка видна в приложении Crisp на телефоне — туда же приходит
push, и в разговор можно вмешаться руками в любой момент.

## Что нужно один раз

1. **Crisp** — завести отдельный сайт для икры (не тот, что для камер):
   Settings → Website settings → Setup даст `Website ID`.
   Settings → Plugins/API → создать плагин с правами на чтение и запись
   сообщений: получите `identifier` и `key`.
2. **Ключ Anthropic** — console.anthropic.com → API Keys. Новый, отдельный.
3. **Cloudflare** — бесплатного тарифа Workers достаточно.

## Развернуть через браузер (проще)

Ничего ставить не нужно, всё делается на сайте Cloudflare.

1. **dash.cloudflare.com** → слева **Workers & Pages** → **Create** →
   **Start with Hello World!** → имя `oceanfresh-chat` → **Deploy**.
2. На странице воркера → **Edit code**. Стереть содержимое редактора и
   вставить целиком файл `tools/chat-worker/worker.bundled.js`
   (открыть его на GitHub, кнопка **Copy raw file**). → **Deploy**.
3. Вкладка **Settings** → **Variables and Secrets** → **Add** →
   тип **Secret**, по одной штуке:
   - `ANTHROPIC_API_KEY` — новый ключ с console.anthropic.com
   - `CRISP_API_ID` — identifier плагина Crisp
   - `CRISP_API_KEY` — key плагина Crisp
   - `CRISP_WEBSITE_ID` — `fed75a74-4131-40a6-b96a-36931d910aa5`
   - `OWNER_PHONE`, `SMS_URL`, `SMS_KEY` — если нужны SMS о заказах
   → **Deploy** ещё раз, чтобы секреты подхватились.
4. Скопировать адрес воркера — он вида
   `https://oceanfresh-chat.ВАШ-ПОДДОМЕН.workers.dev`. Проверить:
   открыть его с `/health` в конце — должно ответить `ok` и дату каталога.
5. **app.crisp.chat** → workspace Caviar → **Settings → Webhooks** →
   **Add webhook**: адрес — воркер плюс `/crisp/webhook`, событие
   **message:send** → сохранить.

Готово: напишите себе в чат на сайте, бот ответит.

После правки цен: `node tools/build-chat-context.js`,
`node tools/build-worker-bundle.js`, снова вставить файл в редактор
Cloudflare и нажать Deploy.

## Развернуть из терминала (если есть Node.js)

```bash
npm install -g wrangler
cd tools/chat-worker
wrangler login

wrangler secret put ANTHROPIC_API_KEY
wrangler secret put CRISP_API_ID
wrangler secret put CRISP_API_KEY
wrangler secret put CRISP_WEBSITE_ID
# необязательно — уведомления о заказах вам на телефон:
wrangler secret put SMS_URL      # адрес вашего сервера отправки SMS
wrangler secret put SMS_KEY
wrangler secret put OWNER_PHONE  # +16173724119

wrangler deploy
```

Секреты хранятся у Cloudflare и в репозиторий не попадают.

Дальше в Crisp: Settings → Webhooks → добавить адрес воркера
`https://oceanfresh-chat.<ваш-домен>.workers.dev/crisp/webhook`, событие
`message:send`.

И включить виджет на сайте: в `assets/js/config.js` вписать
`chat: { crispWebsiteId: "..." }`. Пока там `null`, чат не подключается.

## Если бот молчит

Признак: в чате отвечает не бот, а автоответ Crisp вроде «оставьте email» —
значит вебхук до воркера не доходит или воркер падает.

**1. Открыть `<адрес воркера>/health`** — покажет, какие секреты заданы:

```json
{ "ok": true, "model": "claude-opus-5",
  "secrets": { "ANTHROPIC_API_KEY": true, "CRISP_API_ID": true,
               "CRISP_API_KEY": true, "CRISP_WEBSITE_ID": true } }
```

`false` где-либо — секрет не добавлен или назван с опечаткой. После
добавления секретов нужно нажать **Deploy** ещё раз.

**2. Открыть `<адрес воркера>/selftest?key=<CRISP_WEBSITE_ID>`** — проверит
ключ Claude и доступ к Crisp по-настоящему:

- `claude.ok: false, status: 401` — ключ Anthropic неверный или отозван.
- `claude.ok: false, status: 400` с текстом про модель — на аккаунте нет
  доступа к этой модели, поставьте переменную `MODEL` = `claude-haiku-4-5`.
- `claude.ok: false, status: 429` — кончились деньги на счёте Anthropic.
- `crisp.ok: false, status: 401/403` — плагин Crisp не установлен на этот
  сайт или у него нет прав на сообщения. В marketplace.crisp.chat откройте
  плагин → **Install plugin on website** → выбрать workspace Caviar, и
  проверьте scopes: чтение и запись `website:conversation:messages`.

**3. Проверить вебхук.** app.crisp.chat → workspace Caviar →
Settings → **Webhooks**: адрес должен заканчиваться на `/crisp/webhook`,
событие — `message:send`, состояние — включено. Открытие адреса воркера в
браузере отвечает подсказкой со списком путей: если её нет, адрес неверный.

**4. Посмотреть логи.** В Cloudflare на странице воркера вкладка **Logs** →
**Begin log stream**, затем написать что-нибудь в чат на сайте. Если в логах
пусто — Crisp не достучался до воркера (шаг 3). Если есть строка с ошибкой —
она укажет причину.

## Поддерживать

После любой правки цен, наличия, доставки или сезона:

```bash
node tools/build-chat-context.js    # пересобрать каталог для бота
node tools/build-worker-bundle.js   # и файл для вставки в браузере
cd tools/chat-worker && wrangler deploy
```

Бот знает только то, что лежит в `catalog.json`. Забыли пересобрать — будет
называть старые цены.

## Что бот умеет и чего не делает

Умеет: подбирать икру под повод и число гостей, называть цены и цену за 100 г,
объяснять разницу между видами, рассказывать условия доставки, собирать заказ
(позиции, имя, телефон, способ получения, адрес, дата) и передавать его вам.

Не делает: не подтверждает наличие (это всегда человек), не обещает сроков
сверх заявленных, не выдумывает скидки и цифры, не обсуждает закупку и
поставщиков. На просьбу позвать человека, на опт и на жалобы — сразу зовёт вас.

## Сколько стоит

Один диалог — примерно 1 500 токенов промпта с каталогом плюс переписка.
На `claude-opus-5` выходит около $0.10–0.15 за диалог, на `claude-haiku-4-5` —
около $0.02. Модель меняется переменной `MODEL` без правки кода. Системный
промпт кешируется, поэтому длинные диалоги дешевле, чем кажется.
