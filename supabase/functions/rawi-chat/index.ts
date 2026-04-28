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

function fixCommonPhrases(text: string): string {
  let out = text;
  for (const [re, replacement] of COMMON_PHRASES) {
    out = out.replace(re, replacement);
  }
  return out;
}

function splitGluedWords(text: string): string {
  let out = text;

  // 1) فصل كلمة وظيفية قصيرة ملتصقة ببداية كلمة طويلة (داخل النص)
  //    مثال: "فيالرياض" -> "في الرياض"، "منالأكل" -> "من الأكل"
  for (const fw of FUNCTION_WORDS) {
    // يجب أن تكون مسبوقة بمسافة/بداية نص/علامة ترقيم، وبعدها أحرف عربية تشكّل كلمة طويلة (3+)
    const re = new RegExp(`(^|[\\s\\.\\,\\!\\?\\:\\;\\(\\)\\"\\'\\n])${fw}([\\u0621-\\u064A]{3,})`, "g");
    out = out.replace(re, (_m, p1, p2) => `${p1}${fw} ${p2}`);
  }

  // 2) فصل كلمات الربط الطويلة الملتصقة بما بعدها
  for (const lw of LINK_WORDS) {
    const re = new RegExp(`(^|[\\s\\.\\,\\!\\?\\:\\;\\(\\)\\"\\'\\n])${lw}([\\u0621-\\u064A]{4,})`, "g");
    out = out.replace(re, (_m, p1, p2) => `${p1}${lw} ${p2}`);
  }

  // 3) فصل "ال" التعريف عن كلمة وظيفية ملتصقة قبلها (مثل "والرياض" تُترك، لكن "فيالرياض" التُقطت أعلاه)
  //    لا نلمس واو العطف ولام الجر — هذي صحيحة إملائياً.

  return out;
}

function fixPunctuationSpacing(text: string): string {
  return text
    // مسافة قبل علامات الترقيم تُحذف
    .replace(/\s+([،,\.!\?؟:;])/g, "$1")
    // مسافة بعد علامات الترقيم إن لم توجد
    .replace(/([،,\.!\?؟:;])([\u0621-\u064Aa-zA-Z0-9])/g, "$1 $2")
    // مسافات متعددة -> مسافة واحدة
    .replace(/[ \t]{2,}/g, " ")
    // أسطر فارغة متعددة -> سطر واحد
    .replace(/\n{3,}/g, "\n\n");
}

function sanitizeDialect(text: string) {
  let out = text;
  out = fixCommonPhrases(out);
  out = splitGluedWords(out);
  out = fixPunctuationSpacing(out);
  return out;
}

function sanitizedSseStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = body.getReader();
  let buffer = "";
  let rawAssistant = "";
  let emitted = "";
  const holdTail = 12;

  const makeChunk = (content: string) =>
    `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const finalText = sanitizeDialect(rawAssistant);
          const rest = finalText.slice(emitted.length);
          if (rest) controller.enqueue(encoder.encode(makeChunk(rest)));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content !== "string" || !content) continue;

            rawAssistant += content;
            const safeText = sanitizeDialect(rawAssistant);
            const emitUntil = Math.max(0, safeText.length - holdTail);
            if (emitUntil > emitted.length) {
              const delta = safeText.slice(emitted.length, emitUntil);
              emitted = safeText.slice(0, emitUntil);
              controller.enqueue(encoder.encode(makeChunk(delta)));
              return;
            }
          } catch {
            buffer = `${line}\n${buffer}`;
            return;
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
const SYSTEM_PROMPT = `أنت "الراوي" داخل تطبيق رواة. ابدأ أول رد بترحيب طبيعي مثل: حياك الله، هلا بك، يا هلا، أهلًا وسهلًا. قدّم معلومة مفيدة وواضحة عن أي صنف يسأل عنه المستخدم: كلمات محلية، أمثال، قصص، تراث، أكلات، عادات، أو معالم. اجعل الرد لا يتجاوز 5 سطور كحد أقصى.

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
