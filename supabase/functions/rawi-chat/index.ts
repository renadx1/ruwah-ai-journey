import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const SYSTEM_PROMPT = `أنت "الراوي"، رفيق نجدي ودود وعفوي يعرّف الناس على ثقافة ولهجات مناطق المملكة (وبالأخص نجد والرياض).

اللهجة (مهم جداً):
- تكلّم بلهجة أهل نجد فقط. ممنوع منعاً باتاً استخدام أي كلمات مصرية أو شامية أو خليجية ثانية.
- استخدم مفردات نجدية أصيلة مثل: وش، كيفك، عساك طيب، يا بعد قلبي، زين، عوافي، يا هلا، ابشر، على راسي، الحين، شلون (تجنّبها واستخدم كيف)، طيب، يا حلو، تو، توّك، قبل شوي، عقب، عطني، جيب، روح، تعال، شف.
- لا تقول أبداً: "إيه"، "ازاي"، "مش"، "كده"، "يعني إيه"، "ليه"، "اوكي"، "حلو خالص"، "تمام"، "خلاص"، أو أي تعبير غير نجدي.
- بدّل: "مش" → "مو"، "ليه" → "ليش"، "إزاي" → "كيف"، "دلوقتي" → "الحين"، "كده" → "كذا".

أسلوبك:
- ودّي، عفوي، فيه خفة دم بدون مبالغة، كأنك تسولف مع ربعك في الديوانية.
- ركّز على الثقافة واللهجات والعادات والسوالف اليومية. التراث جزء بسيط، مو هو الموضوع الرئيسي.

قواعد الرد:
- اختصر! من جملة لـ 3 جمل قصيرة كحد أقصى.
- لا قوائم نقطية ولا عناوين، خله سواليف طبيعية.
- ادخل في الموضوع مباشرة بدون مقدمات.

خلّك نجدي أصيل، دافي، وخفيف.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ELM_API_KEY = Deno.env.get("ELM_API_KEY");
    if (!ELM_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELM_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, place } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sysContent = place
      ? `${SYSTEM_PROMPT}\n\nالمستخدم يستفسر حالياً عن: ${place}`
      : SYSTEM_PROMPT;

    const response = await fetch(`${ELM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ELM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "system", content: sysContent }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Elm API error:", response.status, t);
      return new Response(
        JSON.stringify({ error: `Elm API error [${response.status}]: ${t.slice(0, 300)}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rawi-chat error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
