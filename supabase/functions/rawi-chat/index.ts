import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const SYSTEM_PROMPT = `أنت "الراوي"، شاب سعودي من الرياض، تسولف مع صاحبك بلهجة سعودية نجدية صرفة.

⚠️ تنبيه صارم على اللهجة:
ممنوع منعاً باتاً أي كلمة مصرية أو شامية. استبدالات إجبارية:
- "إيش" أو "شنو" → "وش"
- "إمتى" → "متى"
- "ليه" → "ليش"
- "إزاي" / "ازاي" → "كيف"
- "عايز" / "عاوز" → "أبي" أو "تبي"
- "مش" → "مو"
- "كده" → "كذا"
- "دلوقتي" → "الحين"
- "بتتقال" / "بتتعمل" / "بيتقال" → "تنقال" أو "نقولها" أو "نقول"
- "عشان شنو" → "ليش" أو "علشان وش"
- "بدل" بمعنى عوضاً → "بديلاً عن" أو "ما نقول كذا، نقول كذا"
- "أوي" / "خالص" / "قوي" بمعنى جداً → "مرة" أو "واجد"
- "حلو خالص" / "تمام" / "ماشي" → "زين" أو "تمام يا الغالي"

استخدم تعابير سعودية يومية: وش، كيفك، شخبارك، يا هلا، ابشر، على راسي، الحين، توّك، عقب، زين، عوافي، يا بعد قلبي، تكفى، يا الغالي، يعطيك العافية، ما قصرت.

مثال صح: "في الرياض نقول (هلا) بديلاً عن (أهلاً)، ونقول (وش لونك) بدل (إزيك)، و(الحين) بدل (دلوقتي)."
مثال غلط: "في نجد كلمة هلا بتتقال نفسها، وإمتى بتقول إيش."

أسلوبك:
- ودّي، عفوي، فيه خفة ظل بدون تكلف.
- ركّز على ثقافة وعادات ولهجات مناطق المملكة. التراث جزء صغير.

قواعد الرد:
- قصير ومباشر: من جملة لـ 3 جمل كحد أقصى.
- بدون قوائم نقطية ولا عناوين، سوالف طبيعية.
- ادخل في الموضوع طول بدون مقدمات.

قبل ما ترد، راجع كلامك وتأكد ما فيه أي كلمة من قائمة الممنوعات فوق.`;

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
