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

/* каталог вшит при сборке — node tools/build-worker-bundle.js */
const catalog = {
  "updated": "2026-08-27",
  "season": {
    "show": true,
    "harvestEnds": "2026-10-20"
  },
  "contacts": {
    "phone": "+1 (617) 372-4119",
    "instagram": "oceanfreshcaviar",
    "email": null,
    "city": "Boston, MA"
  },
  "shipping": [
    {
      "id": "pickup",
      "title": "Pickup",
      "price": "Free",
      "time": "Same day",
      "details": "Pick it up yourself at a time that suits you. We give the address and hours when we confirm the order."
    },
    {
      "id": "courier",
      "title": "Courier inside I-495",
      "price": "Free",
      "time": "Within three days",
      "details": "Inside the I-495 belt we drive it ourselves, insulated, and hand it over in person. Any day of the week."
    },
    {
      "id": "ship",
      "title": "Other states",
      "price": "Quoted",
      "time": "1–2 days",
      "details": "Express shipping in an insulated box with cold packs, sent Monday to Wednesday so the parcel never sits out a weekend. Cost calculated from address and weight."
    }
  ],
  "products": [
    {
      "id": "paddlefish",
      "name": "Paddlefish",
      "category": "black",
      "origin": "farmed, Tennessee, USA",
      "grain_mm": 2.8,
      "taste": "soft, faintly earthy, no sharp edge",
      "colour": "steel grey",
      "good_for": "a first taste, and feeding a crowd",
      "description": "Even, medium, steel-grey grain and a soft flavour with no sharp edge. The gentlest introduction to black caviar, and the sensible pick when you need volume.",
      "sizes": [
        {
          "key": "paddlefish-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 100,
          "per_100g_usd": 80,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "paddlefish-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 180,
          "per_100g_usd": 72,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "paddlefish-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 350,
          "per_100g_usd": 70,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "paddlefish-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "hackleback",
      "name": "Hackleback",
      "category": "black",
      "origin": "wild, USA",
      "grain_mm": 2.3,
      "taste": "rich and nutty with a note of the sea",
      "colour": "dark grey, nearly black",
      "good_for": "those who like a bold flavour",
      "description": "Small dark grain and a rich, faintly nutty flavour. Wild American fish, with noticeably more character than farmed roe.",
      "sizes": [
        {
          "key": "hackleback-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 125,
          "per_100g_usd": 100,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "hackleback-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 240,
          "per_100g_usd": 96,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "hackleback-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 450,
          "per_100g_usd": 90,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "hackleback-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "kaluga",
      "name": "Kaluga Sturgeon",
      "category": "black",
      "origin": "farmed, imported",
      "grain_mm": 3.4,
      "taste": "creamy and soft with a long finish",
      "colour": "dark grey with bronze",
      "good_for": "when you want beluga, at a fair price",
      "description": "Large grain and a soft, creamy taste with a long finish. Kaluga is often put next to beluga — in grain size and character it is the closest thing to it.",
      "sizes": [
        {
          "key": "kaluga-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 150,
          "per_100g_usd": 120,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "kaluga-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 280,
          "per_100g_usd": 112,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "kaluga-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 500,
          "per_100g_usd": 100,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "kaluga-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "white-sturgeon",
      "name": "White Sturgeon",
      "category": "black",
      "origin": "farmed, California, USA",
      "grain_mm": 3.1,
      "taste": "clean and nutty with a creamy note",
      "colour": "grey-brown",
      "good_for": "an all-round choice for the table",
      "description": "The American classic: medium to large grain and a clean, nutty flavour with a creamy note. Raised on Californian farms — a short trip to Boston.",
      "sizes": [
        {
          "key": "white-sturgeon-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 200,
          "per_100g_usd": 160,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "white-sturgeon-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 380,
          "per_100g_usd": 152,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "white-sturgeon-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 700,
          "per_100g_usd": 140,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "white-sturgeon-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "siberian",
      "name": "Siberian Sturgeon",
      "category": "black",
      "origin": "overseas",
      "grain_mm": 2.9,
      "taste": "creamy-nutty, the classic profile",
      "colour": "dark brown",
      "good_for": "people who know what they expect",
      "description": "The classic sturgeon profile: firm medium grain, a creamy-nutty taste and a long finish. The safe choice for a table you want to impress.",
      "sizes": [
        {
          "key": "siberian-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 240,
          "per_100g_usd": 192,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "siberian-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 430,
          "per_100g_usd": 172,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "siberian-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 800,
          "per_100g_usd": 160,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "siberian-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "beluga-hybrid",
      "name": "Beluga Hybrid",
      "category": "black",
      "origin": "farmed, Florida, USA",
      "grain_mm": 3.5,
      "taste": "mild, delicate, buttery",
      "colour": "light grey",
      "good_for": "gifting and a striking presentation",
      "description": "Large grain and a soft, buttery taste — a beluga-like profile, farmed in Florida and markedly easier on the wallet.",
      "sizes": [
        {
          "key": "beluga-hybrid-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 240,
          "per_100g_usd": 192,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "beluga-hybrid-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 430,
          "per_100g_usd": 172,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "beluga-hybrid-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 800,
          "per_100g_usd": 160,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "beluga-hybrid-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "velvet",
      "name": "Velvet",
      "category": "black",
      "origin": "overseas",
      "grain_mm": 3.6,
      "taste": "velvety texture, a long creamy finish",
      "colour": "dark with a sheen",
      "good_for": "a special occasion",
      "description": "The rarest line on our list: large eggs, a velvety texture and a long, creamy finish. For occasions that deserve it.",
      "sizes": [
        {
          "key": "velvet-125",
          "label": "125 g",
          "grams": 125,
          "price_usd": 300,
          "per_100g_usd": 240,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "velvet-250",
          "label": "250 g",
          "grams": 250,
          "price_usd": 550,
          "per_100g_usd": 220,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "velvet-500",
          "label": "500 g",
          "grams": 500,
          "price_usd": 1000,
          "per_100g_usd": 200,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "velvet-1000",
          "label": "1000 g",
          "grams": 1000,
          "price_usd": null,
          "per_100g_usd": null,
          "in_stock": false,
          "wholesale": true,
          "stock_left": null
        }
      ]
    },
    {
      "id": "chum",
      "name": "Chum Salmon",
      "category": "red",
      "origin": "farmed, Alaska, USA",
      "grain_mm": 5.5,
      "taste": "clean, moderately salted, no bitterness",
      "colour": "amber orange",
      "good_for": "blini, toast, a holiday table",
      "description": "Even, amber, medium-sized grain and a clean taste with no bitterness. The red caviar people expect on the table — for blini, for toast, for gifting.",
      "sizes": [
        {
          "key": "chum-113",
          "label": "4 oz (113 g)",
          "grams": 113,
          "price_usd": 25,
          "per_100g_usd": 22,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "chum-225",
          "label": "8 oz (225 g)",
          "grams": 225,
          "price_usd": 45,
          "per_100g_usd": 20,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "chum-454",
          "label": "1 lb (454 g)",
          "grams": 454,
          "price_usd": 85,
          "per_100g_usd": 19,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        }
      ]
    },
    {
      "id": "gold-chum",
      "name": "Gold Chum",
      "category": "red",
      "origin": "wild, Alaska, USA",
      "grain_mm": 6.2,
      "taste": "lightly salted, soft shell, melts away",
      "colour": "golden orange",
      "good_for": "anyone after larger salmon roe",
      "description": "Large golden eggs, a light cure and a soft shell — they burst easily and melt in the mouth. Wild Pacific salmon from Alaska.",
      "sizes": [
        {
          "key": "gold-chum-500",
          "label": "1.1 lb (500 g)",
          "grams": 500,
          "price_usd": 100,
          "per_100g_usd": 20,
          "in_stock": true,
          "wholesale": false,
          "stock_left": null
        }
      ]
    },
    {
      "id": "pink",
      "name": "Pink Salmon",
      "category": "red",
      "origin": "wild, Alaska or imported",
      "grain_mm": 4.2,
      "taste": "mild, tender grain, a light cure",
      "colour": "light orange",
      "good_for": "an everyday table",
      "description": "Smaller, softer grain than chum and a mild, gently salted taste. Wild fish. Out of stock at the moment — leave a free pre-order and we'll tell you when it lands.",
      "sizes": [
        {
          "key": "pink-113",
          "label": "4 oz (113 g)",
          "grams": 113,
          "price_usd": 22,
          "per_100g_usd": 19,
          "in_stock": false,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "pink-225",
          "label": "8 oz (225 g)",
          "grams": 225,
          "price_usd": 40,
          "per_100g_usd": 18,
          "in_stock": false,
          "wholesale": false,
          "stock_left": null
        },
        {
          "key": "pink-454",
          "label": "1 lb (454 g)",
          "grams": 454,
          "price_usd": 75,
          "per_100g_usd": 17,
          "in_stock": false,
          "wholesale": false,
          "stock_left": null
        }
      ]
    }
  ]
};

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
