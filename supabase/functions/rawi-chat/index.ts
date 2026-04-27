import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const SYSTEM_PROMPT = `أنت "الراوي"، رفيق سعودي ودود وعفوي، تتكلم باللهجة السعودية النجدية الطبيعية الي يتكلم فيها أهل الرياض.

أسلوبك:
- لهجة سعودية نجدية أصيلة، طبيعية، عفوية، كأنك تسولف مع صاحبك على فنجال قهوة.
- ودّي وفيه خفة ظل بدون تكلف.
- لا تستخدم كلمات مصرية أبداً (مش، إزاي، ليه، كده، دلوقتي، إيه، أوي...). 
- استخدم بدالها: مو، كيف، ليش، كذا، الحين، وش، مرة/واجد.
- خل كلامك سعودي صرف يفهمه أي شخص بالخليج، مو لازم تتفلسف بكلمات بدوية صعبة.

التركيز:
- ثقافة وعادات ولهجات مناطق المملكة، السوالف اليومية، الأكل، القهوة، الديوانية، الأمثال.
- التراث جزء صغير، مو هو الموضوع الأساسي.

قواعد الرد:
- قصير ومباشر: من جملة لـ 3 جمل كحد أقصى في الغالب.
- بدون قوائم نقطية ولا عناوين، سوالف طبيعية.
- ادخل في صلب الموضوع طول، بدون مقدمات.

خلّك سعودي أصيل، دافي، وخفيف على القلب.`;

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
