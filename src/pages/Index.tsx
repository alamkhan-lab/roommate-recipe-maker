import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Recipe {
  name: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  steps: string[];
  proTip: string;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-accent text-accent-foreground",
  Medium: "bg-warm-gold text-warm-gold-foreground",
  Hard: "bg-primary text-primary-foreground",
};

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [equipment, setEquipment] = useState("");
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState("30");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setError("Please enter at least some ingredients.");
      return;
    }
    setError("");
    setLoading(true);
    setRecipes([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-recipes",
        {
          body: {
            ingredients: ingredients.trim(),
            equipment: equipment.trim() || "basic kitchen setup",
            time: parseInt(time),
            people,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRecipes(data.recipes || []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-6 shadow-lg">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl text-primary-foreground font-bold">
            🍳 RoomChef
          </h1>
          <p className="text-primary-foreground/80 font-body mt-1">
            Turn your ingredients into delicious Indian recipes
          </p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="bg-card rounded-xl shadow-md p-6 md:p-8 space-y-5">
          <div>
            <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
              What ingredients do you have?
            </label>
            <input
              type="text"
              placeholder="rice, dal, potato, onion, tomato..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
              What equipment?
            </label>
            <input
              type="text"
              placeholder="pressure cooker, pan, gas stove..."
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
                People to cook for?
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
                Time available?
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm font-body">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Recipes"}
          </button>
        </section>

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-body">
              Cooking up recipes for you...
            </p>
          </div>
        )}

        {recipes.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Your Recipes
            </h2>
            <div className="grid gap-6">
              {recipes.map((recipe, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl shadow-md p-6 md:p-8 space-y-4 border border-border"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {recipe.name}
                    </h3>
                    <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${difficultyColor[recipe.difficulty] || "bg-muted text-muted-foreground"}`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs font-body text-muted-foreground">
                      ⏱ {recipe.time}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-body font-semibold text-sm text-foreground mb-2">
                      Ingredients
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm font-body text-muted-foreground">
                      {recipe.ingredients.map((ing, j) => (
                        <li key={j}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-body font-semibold text-sm text-foreground mb-2">
                      Steps
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm font-body text-muted-foreground">
                      {recipe.steps.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm font-body text-secondary-foreground">
                      <span className="font-semibold">💡 Pro Tip:</span>{" "}
                      {recipe.proTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
