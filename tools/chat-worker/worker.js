/**
 * Чат-бот Ocean Fresh Caviar для Crisp.
 * Cloudflare Worker: принимает вебхук Crisp, отвечает через Claude,
 * собирает заказ и присылает уведомление владельцу.
 *
 * Секреты (wrangler secret put ИМЯ) — в репозиторий не попадают:
 *   ANTHROPIC_API_KEY   ключ Claude
 *   CRISP_API_ID        идентификатор плагина Crisp
 *   CRISP_API_KEY       ключ плагина Crisp
 *   CRISP_WEBSITE_ID    идентификатор сайта в Crisp
 *   SMS_URL, SMS_KEY    (необязательно) свой сервер SMS для уведомлений
 *   OWNER_PHONE         (необязательно) телефон для уведомлений
 *   MODEL               (необязательно) модель, по умолчанию claude-opus-5
 */

import catalog from "./catalog.json";

const CRISP_API = "https://api.crisp.chat/v1/website";
const HISTORY_LIMIT = 20;

/* ---------- системный промпт ---------- */
function systemPrompt() {
  const lines = catalog.products.map((p) => {
    const sizes = p.sizes
      .map((s) => {
        const price = s.price_usd ? `$${s.price_usd}` : "price on request";
        const notes = [
          s.wholesale ? "wholesale" : null,
          !s.in_stock && !s.wholesale ? "pre-order only" : null,
          s.stock_left != null ? `${s.stock_left} left` : null,
        ].filter(Boolean);
        return `    - ${s.key} | ${s.label} | ${price}${notes.length ? " | " + notes.join(", ") : ""}`;
      })
      .join("\n");
    return `  ${p.name} (${p.category} caviar, id ${p.id}) — ${p.origin || "origin n/a"}, grain ${
      p.grain_mm
    } mm
    taste: ${p.taste}; colour: ${p.colour}; good for: ${p.good_for}
${sizes}`;
  });

  const ship = catalog.shipping
    .map((s) => `  - ${s.title}: ${s.price}, ${s.time}. ${s.details}`)
    .join("\n");

  return `You are the assistant for Ocean Fresh Caviar, a caviar seller in Boston working under that name since 1997. You talk to customers in the website chat.

CATALOGUE (this is the only source of prices and sizes — never invent or estimate any figure that is not here):
${lines.join("\n")}

WAYS TO GET IT:
${ship}

SEASON: the harvest closes on ${catalog.season.harvestEnds}. After that only what was laid down is sold, quantities are limited and prices rise. A pre-order is free, commits the customer to nothing and locks in today's price.

CONTACTS: text ${catalog.contacts.phone} (messages only, no calls), Instagram @${catalog.contacts.instagram}. Based in ${catalog.contacts.city}.

HOW TO BEHAVE
- Answer in the language the customer writes in. Be warm, short and concrete: two or three sentences unless they ask for detail.
- Help them choose. Ask what the occasion is, how many people, whether they've had caviar before — then suggest a specific tin and say why.
- Quote prices exactly as listed, including the per-100 g figure when it helps compare.
- Availability is confirmed by a person, not by you. Say "I'll confirm this with the team" rather than promising stock.
- Never promise a delivery time beyond what is listed above. Never discuss purchase costs, margins or suppliers.
- Caviar travels only cold, in insulated packaging with cold packs — never dry ice, which freezes and ruins the roe.
- When the customer is ready, collect: items with sizes, name, phone, how they want to get it, address or neighbourhood for courier, preferred date, any comment. Then call create_order.
- Call handoff_to_human when they ask for a person, want wholesale or a restaurant supply, complain, or ask something you cannot answer from the catalogue.
- Never invent stock numbers, discounts, certificates or anything else that is not in this prompt.`;
}

/* ---------- инструменты ---------- */
const TOOLS = [
  {
    name: "create_order",
    description:
      "Record a finished order once the customer has confirmed items and left their contacts. Only call it when you have at least the items, a name and a phone.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Ordered lines",
          items: {
            type: "object",
            properties: {
              key: { type: "string", description: "Size key from the catalogue, e.g. velvet-250" },
              qty: { type: "integer", minimum: 1 },
            },
            required: ["key", "qty"],
          },
        },
        name: { type: "string" },
        phone: { type: "string" },
        shipping: { type: "string", description: "pickup | courier | ship" },
        address: { type: "string" },
        date: { type: "string" },
        comment: { type: "string" },
      },
      required: ["items", "name", "phone"],
    },
  },
  {
    name: "handoff_to_human",
    description:
      "Alert the owner and tell the customer a person will reply shortly. Use for wholesale, complaints, or anything outside the catalogue.",
    input_schema: {
      type: "object",
      properties: { reason: { type: "string" } },
      required: ["reason"],
    },
  },
];

/* ---------- Crisp ---------- */
const crispAuth = (env) => "Basic " + btoa(`${env.CRISP_API_ID}:${env.CRISP_API_KEY}`);

async function crispHistory(env, sessionId) {
  const r = await fetch(`${CRISP_API}/${env.CRISP_WEBSITE_ID}/conversation/${sessionId}/messages`, {
    headers: { Authorization: crispAuth(env), "X-Crisp-Tier": "plugin" },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.data || [])
    .filter((m) => m.type === "text" && typeof m.content === "string" && m.content.trim())
    .slice(-HISTORY_LIMIT)
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.content }));
}

async function crispSend(env, sessionId, text) {
  await fetch(`${CRISP_API}/${env.CRISP_WEBSITE_ID}/conversation/${sessionId}/message`, {
    method: "POST",
    headers: {
      Authorization: crispAuth(env),
      "X-Crisp-Tier": "plugin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "text", content: text, from: "operator", origin: "chat" }),
  });
}

/* ---------- уведомление владельцу ---------- */
async function notifyOwner(env, text) {
  if (!env.SMS_URL || !env.SMS_KEY || !env.OWNER_PHONE) return;
  try {
    await fetch(env.SMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: env.SMS_KEY, phone: env.OWNER_PHONE, message: text.slice(0, 300) }),
    });
  } catch (e) {
    console.log("sms failed", e);
  }
}

function orderText(input) {
  const byKey = {};
  catalog.products.forEach((p) => p.sizes.forEach((s) => (byKey[s.key] = { p, s })));
  let total = 0;
  let ask = false;
  const lines = (input.items || []).map((i) => {
    const hit = byKey[i.key];
    if (!hit) return `• ${i.key} × ${i.qty}`;
    if (hit.s.price_usd) total += hit.s.price_usd * i.qty;
    else ask = true;
    return `• ${hit.p.name} ${hit.s.label} × ${i.qty}${
      hit.s.price_usd ? ` — $${hit.s.price_usd * i.qty}` : " — price on request"
    }`;
  });
  const parts = [
    "NEW ORDER — chat, oceanfreshcaviar.com",
    "",
    ...lines,
    total ? `Total: $${total}${ask ? " + price on request" : ""}` : "",
    "",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.shipping ? `Getting it: ${input.shipping}` : "",
    input.address ? `Address: ${input.address}` : "",
    input.date ? `Date: ${input.date}` : "",
    input.comment ? `Comment: ${input.comment}` : "",
  ];
  return parts.filter(Boolean).join("\n");
}

/* ---------- Claude ---------- */
async function askClaude(env, messages) {
  const body = {
    model: env.MODEL || "claude-opus-5",
    max_tokens: 1024,
    system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
    tools: TOOLS,
    messages,
  };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("claude " + r.status + " " + (await r.text()).slice(0, 200));
  return r.json();
}

/* ---------- обработка одного сообщения ---------- */
async function handleMessage(env, sessionId, text) {
  const history = await crispHistory(env, sessionId);
  const messages = history.length ? history : [{ role: "user", content: text }];

  let reply = await askClaude(env, messages);

  /* до двух проходов: ответ -> инструмент -> итоговая реплика */
  for (let step = 0; step < 2 && reply.stop_reason === "tool_use"; step++) {
    const calls = reply.content.filter((b) => b.type === "tool_use");
    const results = [];
    for (const call of calls) {
      if (call.name === "create_order") {
        const text = orderText(call.input);
        await notifyOwner(env, text);
        await crispSend(env, sessionId, "— — —\n" + text);
        results.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: "Order recorded and sent to the owner. Confirm to the customer that a person will reply shortly to agree the details and payment.",
        });
      } else if (call.name === "handoff_to_human") {
        await notifyOwner(env, `Chat: customer asks for a person — ${call.input.reason}`);
        results.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: "The owner has been notified. Tell the customer a person will reply shortly.",
        });
      } else {
        results.push({ type: "tool_result", tool_use_id: call.id, content: "Unknown tool.", is_error: true });
      }
    }
    messages.push({ role: "assistant", content: reply.content });
    messages.push({ role: "user", content: results });
    reply = await askClaude(env, messages);
  }

  const out = reply.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (out) await crispSend(env, sessionId, out);
}

/* ---------- точка входа ---------- */
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    /* Что настроено, а что нет. Значения секретов не раскрываются. */
    if (request.method === "GET" && url.pathname === "/health")
      return json({
        ok: true,
        catalog_updated: catalog.updated,
        products: catalog.products.length,
        model: env.MODEL || "claude-opus-5",
        secrets: {
          ANTHROPIC_API_KEY: !!env.ANTHROPIC_API_KEY,
          CRISP_API_ID: !!env.CRISP_API_ID,
          CRISP_API_KEY: !!env.CRISP_API_KEY,
          CRISP_WEBSITE_ID: !!env.CRISP_WEBSITE_ID,
          OWNER_PHONE: !!env.OWNER_PHONE,
        },
      });

    /* Проверка ключа Claude и доступа к Crisp.
       Открывается только с ?key=<CRISP_WEBSITE_ID>. */
    if (request.method === "GET" && url.pathname === "/selftest") {
      if (!env.CRISP_WEBSITE_ID || url.searchParams.get("key") !== env.CRISP_WEBSITE_ID)
        return json({ error: "add ?key=<CRISP_WEBSITE_ID>" }, 403);

      const out = { claude: null, crisp: null };
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": env.ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: env.MODEL || "claude-opus-5",
            max_tokens: 32,
            messages: [{ role: "user", content: "Ответь одним словом: работает" }],
          }),
        });
        const body = await r.text();
        out.claude = r.ok
          ? { ok: true, reply: (JSON.parse(body).content || [])[0]?.text || "" }
          : { ok: false, status: r.status, error: body.slice(0, 300) };
      } catch (e) {
        out.claude = { ok: false, error: String(e).slice(0, 200) };
      }

      try {
        const r = await fetch(`${CRISP_API}/${env.CRISP_WEBSITE_ID}/conversations/1`, {
          headers: { Authorization: crispAuth(env), "X-Crisp-Tier": "plugin" },
        });
        out.crisp = r.ok
          ? { ok: true, conversations: ((await r.json()).data || []).length }
          : { ok: false, status: r.status, error: (await r.text()).slice(0, 300) };
      } catch (e) {
        out.crisp = { ok: false, error: String(e).slice(0, 200) };
      }
      return json(out);
    }
    if (request.method !== "POST" || url.pathname !== "/crisp/webhook")
      return json({ error: "not found", try: ["/health", "/selftest?key=…", "POST /crisp/webhook"] }, 404);

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("ok");
    }
    if (data.event !== "message:send") return new Response("ok");

    const d = data.data || {};
    const text = typeof d.content === "string" ? d.content : "";
    if (!text || !d.session_id || d.origin === "operator" || d.from === "operator")
      return new Response("ok");

    /* отвечаем в фоне: Crisp ждёт быстрый 200 */
    ctx.waitUntil(
      handleMessage(env, d.session_id, text).catch(async (e) => {
        console.log("handle failed", e);
        await crispSend(
          env,
          d.session_id,
          "Извините, я сейчас не могу ответить. Напишите нам сообщением на +1 (617) 372-4119 — ответим сразу."
        );
      })
    );
    return new Response("ok");
  },
};
