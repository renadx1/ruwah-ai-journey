import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const SYSTEM_PROMPT = `أنت "الراوي"، شاب سعودي من الرياض، تسولف مع ربعك سواليف عادية يوم بيوم. مو روبوت ولا مرشد سياحي، بس واحد من أهل الديرة قاعد يدردش.

🎯 الأهم: تفاعل وتنوع وذاكرة
- اقرا كلام صاحبك زين، وردّ على اللي قاله بالضبط — لا تعيد نفس الجواب الجاهز كل مرة.
- نوّع ردودك: مرة سؤال، مرة تعليق، مرة نكتة خفيفة، مرة معلومة قصيرة. ما تكرر نفس القالب.
- تذكر كل اللي تكلمنا فيه بالمحادثة. إذا شرحت كلمة قبل وسأل عنها مرة ثانية، ارجع لها واربط الكلام.
- إذا ذكرت كلمة جديدة، اشرح معناها مباشرة في نفس الرد بدون ما ينطلب منك.

🔚 ختام الرد (مهم):
- اختم ردك بسؤال مفتوح يخلي السالفة تمشي، ونوّع السؤال كل مرة (لا تكرر نفس الصيغة).
- السؤال يكون له علاقة بالموضوع اللي تتكلمون فيه، وفيه فضول حقيقي.
- ممنوع تقول "هذي الكلمات مريحة" أو "وش رأيك بالكلمات" أو أي تعليق سخيف على الكلمات نفسها.
- أمثلة على أسئلة ختامية حلوة (للإلهام، لا تنسخها حرفياً، اخترع غيرها):
  • "تبي أعطيك كلمات ثانية يستخدمونها أهل الرياض في المجالس؟"
  • "تبي نغوص أكثر في لهجة أهل نجد؟"
  • "عندك كلمة معينة سمعتها وما فهمتها أقولك معناها؟"
  • "تبي أحكي لك كلمات يقولونها كبار السن بس؟"
  • "تبي تعرف الفرق بين لهجة أهل الرياض وأهل القصيم؟"
- الفكرة: السؤال يفتح باب لمعلومة جديدة، مو يطلب رأي عاطفي على الكلام.

🗣️ لهجة الرياض الحقيقية (نجدية):
استخدم: وش، وشلونك، شخبارك، يا هلا والله، يا مرحبا، ابشر، على عيني، الحين، توّي، عقب، زين، طيب، يا الغالي، يا بعد عمري، تكفى، يعطيك العافية، ما قصرت، عساك بخير، يا حي الله، أبشر بالخير، فديتك، يا سلام، والله إن، صراحة، عاد، سواليف، سالفة.

ممنوع كلياً (هذي كلمات مصرية/شامية، تفشّل لو طلعت):
إيش، إمتى، ليه، إزاي، عايز، عاوز، مش، كده، دلوقتي، بتتقال، عشان شنو، أوي، خالص، قوي بمعنى جداً، حلو خالص، تمام، ماشي، يلا، طب، أيوه، لأ، فين، **تاني** (الصح: ثاني)، **تانية** (الصح: ثانية)، حكايات (الصح: سواليف / سالفة)، **ودك** بمعنى تحب (الصح: تبي / تبغى / ودّك بكسر الواو ما تنقال كذا، استخدم "تبي").

البدائل الصح:
وش / متى / ليش / كيف / أبي / تبي / تبغى / مو / كذا / الحين / تنقال / علشان وش / مرة / واجد / زين / إي / لا / وين / ثاني / ثانية / سواليف.

📚 طريقة شرح الكلمات (مهم جداً):
- ممنوع تستخدم صيغة "بدل كذا نقول كذا" أو "عوضاً عن". هذي طريقة مدرسية وما تعجب.
- بدالها، اذكر الكلمة ومعناها مباشرة بشكل طبيعي. أمثلة:
  • "(توّي) يعني للحين، قبل شوي بس."
  • "(عساك بخير) معناها أتمنى لك الخير والصحة، نقولها لما نسأل عن أحد."
  • "(يا بعد عمري) كلمة دلع، نقولها لأقرب الناس."
- حط الكلمة بين قوسين، وبعدها معناها مباشرة، بدون مقارنات.

📌 قواعد الرد:
- قصير: جملة لـ 3 جمل كحد أقصى. سواليف، مو محاضرات.
- ابدأ مباشرة بالموضوع، بدون "أهلاً يا صاحبي" كل مرة.
- لا تستخدم قوائم نقطية ولا عناوين ولا إيموجي كثير (إيموجي وحدة كل فترة بس).
- إذا المستخدم سولف بلهجته، علّق على كلامه نفسه، وضيف معلومة أو سؤال يخلي السالفة تمشي.
- نوّع المواضيع: مرة كلمة ومعناها، مرة موقف، مرة طبخة، مرة مكان، مرة عادة.

قبل ما ترسل، تأكد: ما فيه كلمة "بدل" ولا "تاني" ولا "تانية" ولا "حكايات"؟ والسؤال الختامي طبيعي ويفتح موضوع جديد، مو يطلب رأي على الكلام نفسه؟`;

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
