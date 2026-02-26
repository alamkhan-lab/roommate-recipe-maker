import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, equipment, time, people } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a professional Indian chef and recipe writer. The user has:
- Ingredients: ${ingredients}
- Equipment: ${equipment}
- Time: ${time} minutes
- Serving: ${people} people

Generate exactly 3 Indian recipes (mix of veg and non-veg if possible given ingredients).

For EACH recipe, provide detailed, well-defined content:

1. **name** - Creative recipe name
2. **time** - Total cooking time as string (e.g. "25 mins")
3. **difficulty** - "Easy", "Medium", or "Hard"
4. **description** - A 2-3 sentence appetizing description of the dish
5. **ingredients** - Array of ingredients with exact quantities for ${people} people (e.g. "2 cups basmati rice", "1 tsp cumin seeds")
6. **steps** - Array of 6-10 DETAILED step-by-step instructions. Each step should be a full paragraph (2-4 sentences) explaining the technique, what to look/smell for, timing details, and common mistakes to avoid. Make these genuinely educational.
7. **proTip** - A detailed pro tip (2-3 sentences) with advanced cooking advice
8. **servingSuggestion** - What to serve alongside this dish
9. **youtubeSearch** - A YouTube search query string that would find a similar recipe video (e.g. "how to make dal tadka recipe Indian")
10. **referenceUrl** - A search query for finding this recipe online (e.g. "authentic dal tadka recipe")

Return ONLY valid JSON array, no markdown, no code blocks:
[{"name":"...","time":"...","difficulty":"...","description":"...","ingredients":["..."],"steps":["..."],"proTip":"...","servingSuggestion":"...","youtubeSearch":"...","referenceUrl":"..."}]`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a professional Indian chef and recipe educator. Return ONLY valid JSON arrays, no markdown formatting, no code blocks, no extra text. Provide detailed, educational step-by-step instructions that teach cooking techniques.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let recipes;
    try {
      recipes = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("Failed to parse recipe data");
    }

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
