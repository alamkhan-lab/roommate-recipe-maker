import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      console.error("DALL-E image generation failed:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (e) {
    console.error("DALL-E image generation error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, equipment, time, people, dietaryNotes } = await req.json();

    const API_KEY = Deno.env.get("ChatGPT_API");
    if (!API_KEY) throw new Error("ChatGPT_API is not configured");

    const dietaryContext = dietaryNotes ? `\n- Dietary Requirements: ${dietaryNotes}` : "";

    const prompt = `You are a professional Indian chef and recipe writer. The user has:
- Ingredients: ${ingredients}
- Equipment: ${equipment}
- Time: ${time} minutes
- Serving: ${people} people${dietaryContext}

Generate exactly 3 Indian recipes (try to satisfy dietary requirements above).

For EACH recipe, provide detailed, well-defined content:

1. **name** - Creative recipe name
2. **time** - Total cooking time as string (e.g. "25 mins")
3. **difficulty** - "Easy", "Medium", or "Hard"
4. **description** - A 2-3 sentence appetizing description of the dish
5. **ingredients** - Array of ingredients with exact quantities for ${people} people (e.g. "2 cups basmati rice", "1 tsp cumin seeds")
6. **steps** - Array of 6-10 DETAILED step-by-step instructions. Each step should be a full paragraph (2-4 sentences) explaining the technique, what to look/smell for, timing details, and common mistakes to avoid. Make these genuinely educational.
7. **proTip** - A detailed pro tip (2-3 sentences) with advanced cooking advice
8. **servingSuggestion** - What to serve alongside this dish
9. **youtubeSearch** - A YouTube search query string that would find a similar recipe video
10. **referenceUrl** - A search query for finding this recipe online
11. **isVegetarian** - boolean, true if the recipe contains no meat/fish/eggs
12. **isGlutenFree** - boolean, true if the recipe contains no wheat/gluten
13. **spiceLevel** - "none", "mild", "medium", or "hot"

Return ONLY valid JSON array, no markdown, no code blocks:
[{"name":"...","time":"...","difficulty":"...","description":"...","ingredients":["..."],"steps":["..."],"proTip":"...","servingSuggestion":"...","youtubeSearch":"...","referenceUrl":"...","isVegetarian":true,"isGlutenFree":false,"spiceLevel":"medium"}]`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional Indian chef and recipe educator. Return ONLY valid JSON arrays, no markdown formatting, no code blocks, no extra text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("OpenAI API error: " + response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/,\s*([\]}])/g, "$1")
      .trim();

    let recipes;
    try {
      recipes = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("Failed to parse recipe data");
    }

    // Generate hero images using DALL-E 3 (skip step images to save API calls)
    const imagePromises = recipes.map((r: any) =>
      generateImage(
        `Beautiful appetizing food photography of the Indian dish "${r.name}". Top-down view on a rustic plate, warm lighting, garnished beautifully. Ultra high resolution.`,
        API_KEY
      )
    );

    const images = await Promise.all(imagePromises);
    for (let i = 0; i < recipes.length; i++) {
      recipes[i].image = images[i];
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
