import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import najdiFoods from "./najdi_food.json" with { type: "json" };

const ELM_BASE_URL = Deno.env.get("ELM_BASE_URL") ?? "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

const NAJDI_FOODS_REF = (najdiFoods as Array<{name:string;desc:string;meal:string;season:string;taste:string;region:string}>)
  .map(f => `- ${f.name}: ${f.desc} (${f.meal}، ${f.season}، ${f.taste}، ${f.region})`)
  .join("\n");

// قاموس تعابير شائعة يجب أن تكون مفصولة بمسافة
const COMMON_PHRASES: Array<[RegExp, string]> = [
  [/حياك\s*ا?لله/g, "حياك الله"],
  [/هلا\s*بك/g, "هلا بك"],
  [/يا\s*هلا/g, "يا هلا"],
  [/أهلا\s*و?سهلا/g, "أهلًا وسهلًا"],
  [/إن\s*شاء\s*ا?لله/g, "إن شاء الله"],
  [/ما\s*شاء\s*ا?لله/g, "ما شاء الله"],
  [/بسم\s*ا?لله/g, "بسم الله"],
  [/الحمد\s*لله/g, "الحمد لله"],
  [/سبحان\s*ا?لله/g, "سبحان الله"],
  [/جزاك\s*ا?لله/g, "جزاك الله"],
  [/بإذن\s*ا?لله/g, "بإذن الله"],
];

// كلمات وظيفية قصيرة شائعة (حروف جر، أدوات، ضمائر) — تُفصل إذا التصقت ببداية كلمة طويلة
const FUNCTION_WORDS = [
  "في", "من", "إلى", "على", "عن", "مع", "عند", "إن", "أن", "لن", "لم", "قد",
  "هذا", "هذه", "ذلك", "تلك", "هؤلاء", "الذي", "التي", "الذين",
  "هو", "هي", "هم", "هن", "أنا", "أنت", "نحن",
  "كل", "بعض", "غير", "بين", "بعد", "قبل", "حتى", "أو", "أم", "ثم", "بل", "لكن", "لأن", "كي", "لو", "إذا",
];

// كلمات ربط طويلة قد تلتصق بما بعدها
const LINK_WORDS = ["لكن", "لأن", "كذلك", "أيضا", "أيضًا", "حيث", "بينما", "عندما", "حينما"];

// كلمات يمنع تكسيرها بمسافة داخلية (المشكلة المعاكسة: "أم ثال" -> "أمثال")
// نضع هنا كلمات شائعة تتعرض للتكسير الخاطئ من نموذج البث
const NEVER_SPLIT_WORDS = [
  "أمثال", "الأمثال", "أمثلة", "الأمثلة",
  "تراث", "التراث", "تراثية", "التراثية", "تراثي", "التراثي",
  "عادات", "العادات", "تقاليد", "التقاليد",
  "أكلات", "الأكلات", "أطعمة", "الأطعمة", "مأكولات", "المأكولات",
  "كلمات", "الكلمات", "مفردات", "المفردات", "لهجة", "اللهجة", "لهجات", "اللهجات",
  "قصص", "القصص", "قصة", "القصة", "حكاية", "الحكاية", "حكايات", "الحكايات",
  "معالم", "المعالم", "تاريخ", "التاريخ", "تاريخية", "التاريخية",
  "نجدية", "النجدية", "نجدي", "النجدي", "نجد",
  "الرياض", "السعودية", "العربية",
  "مجالس", "المجالس", "قهوة", "القهوة", "كرم", "الكرم", "ضيافة", "الضيافة",
  "محدد", "محددة", "معين", "معينة", "معروف", "معروفة", "مشهور", "مشهورة",
  "الجزيرة", "جزيرة", "الصحراء", "صحراء",
];

function fixCommonPhrases(text: string): string {
  let out = text;
  for (const [re, replacement] of COMMON_PHRASES) {
    out = out.replace(re, replacement);
  }
  return out;
}

// إصلاح الكلمات المكسورة: لو وجدنا تسلسل أحرف عربية بمسافات داخلية يُطابق كلمة من القاموس بعد إزالة المسافات، نُعيد دمجها
function fixBrokenWords(text: string): string {
  let out = text;
  for (const word of NEVER_SPLIT_WORDS) {
    // نبني regex يسمح بمسافات اختيارية بين كل حرفين من حروف الكلمة
    const pattern = word.split("").map(ch => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*");
    // الكلمة يجب أن تكون محاطة بحدود كلمة (بداية/نهاية/مسافة/علامة ترقيم) لتجنب لمس كلمات أطول
    const re = new RegExp(`(^|[\\s\\.,!\\?؟:;\\(\\)"'\\n])${pattern}(?=$|[\\s\\.,!\\?؟:;\\(\\)"'\\n])`, "g");
    out = out.replace(re, (_m, p1) => `${p1}${word}`);
  }
  return out;
}

function splitGluedWords(text: string): string {
  let out = text;

  // 1) فصل كلمة وظيفية قصيرة ملتصقة ببداية كلمة طويلة
  for (const fw of FUNCTION_WORDS) {
    const re = new RegExp(`(^|[\\s\\.\\,\\!\\?\\:\\;\\(\\)\\"\\'\\n])${fw}([\\u0621-\\u064A]{3,})`, "g");
    out = out.replace(re, (_m, p1, p2) => `${p1}${fw} ${p2}`);
  }

  // 2) فصل كلمات الربط الطويلة الملتصقة بما بعدها
  for (const lw of LINK_WORDS) {
    const re = new RegExp(`(^|[\\s\\.\\,\\!\\?\\:\\;\\(\\)\\"\\'\\n])${lw}([\\u0621-\\u064A]{4,})`, "g");
    out = out.replace(re, (_m, p1, p2) => `${p1}${lw} ${p2}`);
  }

  return out;
}

function fixPunctuationSpacing(text: string): string {
  return text
    .replace(/\s+([،,\.!\?؟:;])/g, "$1")
    .replace(/([،,\.!\?؟:;])([\u0621-\u064Aa-zA-Z0-9])/g, "$1 $2")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function sanitizeDialect(text: string) {
  let out = text;
  out = fixBrokenWords(out);   // أولاً ندمج المكسور
  out = fixCommonPhrases(out); // ثم نُصلح التعابير الشائعة
  out = splitGluedWords(out);  // ثم نفصل الملتصق
  out = fixPunctuationSpacing(out);
  return out;
}

// تدقيق إملائي عبر Lovable AI لجملة واحدة فقط (سريع، يحافظ على المعنى واللهجة)
async function spellCheckSentence(sentence: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return sentence;
  // لا تدقّق الجمل القصيرة جداً (ترحيب، علامات ترقيم)
  if (sentence.trim().length < 8) return sentence;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000); // مهلة 4 ثواني كحد أقصى

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "أنت مدقّق إملائي للعربية واللهجة النجدية. صحّح الأخطاء الإملائية فقط (كلمات مكسورة بمسافة، حروف ناقصة، همزات، كلمات ملتصقة) دون تغيير المعنى أو الأسلوب أو إضافة أي شيء. لا تترجم، لا تشرح، لا تغيّر اللهجة. أرجع النص المصحَّح فقط بدون أي مقدمة أو علامات اقتباس."
          },
          { role: "user", content: sentence }
        ],
        temperature: 0,
        stream: false,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) return sentence;
    const data = await resp.json();
    const fixed = data?.choices?.[0]?.message?.content;
    if (typeof fixed !== "string" || !fixed.trim()) return sentence;
    // حماية: لو الرد طوله مختلف بشكل كبير (>1.5x) رجّع الأصل
    if (fixed.length > sentence.length * 1.5 || fixed.length < sentence.length * 0.5) return sentence;
    return fixed.trim();
  } catch {
    return sentence;
  }
}

// يفصل النص لجمل كاملة (تنتهي بـ . ! ؟ \n) + ما تبقى من جملة جزئية
function splitIntoSentences(text: string): { sentences: string[]; remainder: string } {
  const re = /[^.!؟\n]+[.!؟\n]+/g;
  const sentences: string[] = [];
  let lastIdx = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    sentences.push(match[0]);
    lastIdx = match.index + match[0].length;
  }
  const remainder = text.slice(lastIdx);
  return { sentences, remainder };
}

// بث حي حرف-بحرف: نمرّر دفعات النموذج فوراً بعد تنظيف خفيف فقط
// نحتفظ بآخر كلمة غير مكتملة في "tail" حتى تنتهي قبل تنظيفها (لتفادي قطع الكلمة)
function sanitizedSseStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = body.getReader();
  let buffer = "";
  let tail = ""; // كلمة جزئية لم تكتمل بعد

  const makeChunk = (content: string) =>
    `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (tail) {
            const cleaned = sanitizeDialect(tail);
            controller.enqueue(encoder.encode(makeChunk(cleaned)));
            tail = "";
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let chunkOut = "";
        for (const rawLine of lines) {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content !== "string" || !content) continue;
            // نضم المحتوى الجديد للذيل غير المكتمل
            const combined = tail + content;
            // نقطع عند آخر فاصل (مسافة/سطر/ترقيم) لنحتفظ بكلمة جزئية فقط
            const lastBreak = Math.max(
              combined.lastIndexOf(" "),
              combined.lastIndexOf("\n"),
              combined.lastIndexOf("،"),
              combined.lastIndexOf("."),
              combined.lastIndexOf("؟"),
              combined.lastIndexOf("!"),
            );
            if (lastBreak >= 0) {
              const ready = combined.slice(0, lastBreak + 1);
              tail = combined.slice(lastBreak + 1);
              chunkOut += sanitizeDialect(ready);
            } else {
              tail = combined;
            }
          } catch {
            buffer = `${line}\n${buffer}`;
          }
        }

        if (chunkOut) {
          controller.enqueue(encoder.encode(makeChunk(chunkOut)));
          return;
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
const SYSTEM_PROMPT_BASE = `أنت "الراوي" داخل تطبيق رواة. قدّم معلومة مفيدة وواضحة عن أي صنف يسأل عنه المستخدم: كلمات محلية، أمثال، قصص، تراث، أكلات، عادات، أو معالم. اجعل الرد لا يتجاوز 5 سطور كحد أقصى. ادخل في صلب الإجابة مباشرة بدون ترحيب أو مقدمات (لا تقل "حياك الله" ولا "أهلًا" ولا "هلا" ولا أي تحية في بداية الرد).

عند السؤال عن الأكلات النجدية، اعتمد على هذه المرجعية الموثوقة فقط ولا تخترع أكلات خارجها:
${NAJDI_FOODS_REF}`;

const SYSTEM_PROMPT_FIRST = `أنت "الراوي" داخل تطبيق رواة. ابدأ هذا الرد فقط بترحيب قصير وطبيعي مثل: حياك الله، هلا بك، يا هلا، أهلًا وسهلًا. ثم قدّم معلومة مفيدة وواضحة عن أي صنف يسأل عنه المستخدم: كلمات محلية، أمثال، قصص، تراث، أكلات، عادات، أو معالم. اجعل الرد لا يتجاوز 5 سطور كحد أقصى.

عند السؤال عن الأكلات النجدية، اعتمد على هذه المرجعية الموثوقة فقط ولا تخترع أكلات خارجها:
${NAJDI_FOODS_REF}`;

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
    const finalMessages = [{ role: "system", content: sysContent }, ...messages];

    const response = await fetch(`${ELM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ELM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: finalMessages,
        temperature: 0.45,
        top_p: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Elm API error:", response.status, t);
      const isOffline = t.includes("ngrok") || t.includes("ERR_NGROK") || response.status === 404;
      const friendly = isOffline
        ? "خادم نهى (Elm) غير متصل حالياً. تأكد إن الـ tunnel شغال أو حدّث رابط ELM_BASE_URL."
        : `Elm API error [${response.status}]: ${t.slice(0, 300)}`;
      return new Response(
        JSON.stringify({ error: friendly }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "لم أتلقَّ ردًا من نهى." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(sanitizedSseStream(response.body), {
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
