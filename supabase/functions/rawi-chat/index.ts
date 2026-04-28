import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const ELM_BASE_URL = Deno.env.get("ELM_BASE_URL") ?? "https://elmodels.ngrok.app/v1";
const MODEL_NAME = "nuha-2.0";

function sanitizeDialect(text: string) {
  return text;
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

const SYSTEM_PROMPT = ``;

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
