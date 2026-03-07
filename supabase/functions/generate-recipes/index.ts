import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateImage(prompt: string, geminiApiKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini image generation failed:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Gemini image generation error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, equipment, time, people, dietaryNotes } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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

    // Use OpenAI API for recipe text generation
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    // Generate images with Gemini if API key is available
    if (GEMINI_API_KEY) {
      const allImageJobs: { recipeIdx: number; type: "hero" | "step"; stepIdx?: number; prompt: string }[] = [];

      for (let ri = 0; ri < recipes.length; ri++) {
        const r = recipes[ri];
        allImageJobs.push({
          recipeIdx: ri,
          type: "hero",
          prompt: `Beautiful appetizing food photography of the Indian dish "${r.name}". Top-down view on a rustic plate, warm lighting, garnished beautifully. Ultra high resolution.`,
        });
        for (let si = 0; si < r.steps.length; si++) {
          const stepText = r.steps[si].substring(0, 200);
          allImageJobs.push({
            recipeIdx: ri,
            type: "step",
            stepIdx: si,
            prompt: `Cooking process photo for Indian recipe "${r.name}", step ${si + 1}: ${stepText}. Realistic kitchen scene, overhead angle, showing hands cooking. High quality food photography.`,
          });
        }
      }

      const BATCH_SIZE = 5;
      const imageResults = new Array(allImageJobs.length).fill(null);

      for (let b = 0; b < allImageJobs.length; b += BATCH_SIZE) {
        const batch = allImageJobs.slice(b, b + BATCH_SIZE);
        const results = await Promise.all(
          batch.map((job) => generateImage(job.prompt, GEMINI_API_KEY))
        );
        for (let i = 0; i < results.length; i++) {
          imageResults[b + i] = results[i];
        }
      }

      for (let j = 0; j < allImageJobs.length; j++) {
        const job = allImageJobs[j];
        const img = imageResults[j];
        if (job.type === "hero") {
          recipes[job.recipeIdx].image = img;
        } else if (job.type === "step" && job.stepIdx !== undefined) {
          if (!recipes[job.recipeIdx].stepImages) {
            recipes[job.recipeIdx].stepImages = [];
          }
          recipes[job.recipeIdx].stepImages[job.stepIdx] = img;
        }
      }
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
