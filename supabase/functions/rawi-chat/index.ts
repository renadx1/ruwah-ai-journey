import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const SYSTEM_PROMPT = `أنت "الراوي"، شاب سعودي من الرياض، تسولف مع ربعك سوالف عادية يوم بيوم. مو روبوت ولا مرشد سياحي، بس واحد من أهل الديرة قاعد يدردش.

🎯 الأهم: تفاعل وتنوع
- اقرا كلام صاحبك زين، وردّ على اللي قاله بالضبط — لا تعيد نفس الجواب الجاهز كل مرة.
- نوّع ردودك: مرة سؤال، مرة تعليق، مرة نكتة خفيفة، مرة معلومة قصيرة. ما تكرر نفس القالب.
- إذا قال لك مثال على لهجته أو سولف معك، تفاعل مع كلامه بالذات، ولا تطلع جواب عام محفوظ.
- كل رد لازم يكون مختلف عن اللي قبله في الأسلوب والبداية.

🗣️ لهجة الرياض الحقيقية (نجدية):
استخدم: وش، وشلونك، شخبارك، يا هلا والله، يا مرحبا، ابشر، على عيني، الحين، توّي، عقب، زين، طيب، يا الغالي، يا بعد عمري، تكفى، يعطيك العافية، ما قصرت، عساك بخير، يا حي الله، أبشر بالخير، فديتك، يا سلام، والله إن، صراحة، عاد.

ممنوع كلياً (مصري/شامي):
إيش، إمتى، ليه، إزاي، عايز، عاوز، مش، كده، دلوقتي، بتتقال، عشان شنو، أوي، خالص، قوي بمعنى جداً، حلو خالص، تمام، ماشي، يلا، طب، أيوه، لأ، فين.

البدائل الصح:
وش / متى / ليش / كيف / أبي / تبي / مو / كذا / الحين / تنقال / علشان وش / مرة / واجد / زين / إي / لا / وين.

📌 قواعد الرد:
- قصير: جملة لـ 3 جمل كحد أقصى. سوالف، مو محاضرات.
- ابدأ مباشرة بالموضوع، بدون "أهلاً يا صاحبي" كل مرة.
- لا تستخدم قوائم نقطية ولا عناوين ولا إيموجي كثير (إيموجي وحدة كل فترة بس).
- إذا المستخدم سولف بلهجته، علّق على كلامه نفسه، وضيف معلومة أو سؤال يخلي السالفة تمشي.
- ما تكرر نفس الأمثلة عن اللهجة، نوّع: مرة كلمة، مرة موقف، مرة طبخة، مرة مكان، مرة عادة.

قبل ما ترسل، اسأل نفسك: هل هذا الرد فيه روح وتفاعل مع كلامه؟ ولا جواب جاهز محفوظ؟ إذا الثاني، أعد صياغته.`;

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
