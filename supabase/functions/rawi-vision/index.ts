// Vision endpoint: identifies Saudi heritage elements in user-uploaded images
// using Lovable AI Gateway (Gemini 2.5 Pro / Flash for vision).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "الراوي"، خبير في التراث السعودي وتراث منطقة نجد والرياض خصوصاً.
سيُرسل لك المستخدم صورة (أو أكثر) ومعها سؤال أو طلب اختياري.
مهمتك:
1. تعرّف بدقة على العناصر التراثية الظاهرة في الصورة:
   - المباني والمعالم (مساجد، قصور، حصون، أسوار طينية، نقوش نجدية...)
   - الأزياء (ثوب، شماغ، عقال، عباءة، زبون...)
   - المقتنيات والأدوات (دلة، فنجال، مبخرة، خنجر، سيف، مرس...)
   - الأكلات الشعبية (كبسة، جريش، مطازيز، قرصان، قهوة عربية...)
   - الفنون والحرف (سدو، خوص، نقش حناء، خط عربي...)
2. اشرح كل عنصر بإيجاز: اسمه، أصله، قيمته الثقافية أو استخدامه.
3. إذا لم تكن متأكداً، قل ذلك بوضوح بدل التخمين.
4. إذا كانت الصورة لا تحتوي على عناصر تراثية واضحة، صف ما تراه واقترح كيف يرتبط بالتراث (إن أمكن).
5. أجب بالعربية الفصحى المبسطة، بأسلوب دافئ مختصر وغني بالمعلومة.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY غير مهيأ" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { images, prompt, place } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: "يجب إرسال صورة واحدة على الأقل" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userText = (prompt && typeof prompt === "string" && prompt.trim().length > 0)
      ? prompt.trim()
      : "تعرّف على العناصر التراثية في هذه الصورة واشرحها لي.";

    const sysContent = place
      ? `${SYSTEM_PROMPT}\n\nالمستخدم حالياً يستفسر بسياق: ${place}`
      : SYSTEM_PROMPT;

    // Build multimodal user content
    const userContent: any[] = [{ type: "text", text: userText }];
    for (const img of images) {
      if (typeof img === "string" && (img.startsWith("data:image") || img.startsWith("http"))) {
        userContent.push({ type: "image_url", image_url: { url: img } });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: sysContent },
          { role: "user", content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد قليل." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "انتهى الرصيد. يرجى إضافة رصيد للمساعد." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("Vision gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: `خطأ في خدمة الرؤية [${response.status}]` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rawi-vision error:", e);
    const msg = e instanceof Error ? e.message : "خطأ غير متوقع";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
