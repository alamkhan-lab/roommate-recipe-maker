import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Youtube, ChefHat, Clock, Flame, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface Recipe {
  name: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  ingredients: string[];
  steps: string[];
  proTip: string;
  servingSuggestion: string;
  youtubeSearch: string;
  referenceUrl: string;
  image?: string | null;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-accent text-accent-foreground",
  Medium: "bg-warm-gold text-warm-gold-foreground",
  Hard: "bg-primary text-primary-foreground",
};

const RecipeCard = ({ recipe, index }: { recipe: Recipe; index: number }) => {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedback !== null) return;
    setSubmitting(true);
    const { error } = await supabase.from("recipe_feedback").insert({
      recipe_name: recipe.name,
      is_helpful: isHelpful,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not save feedback. Try again.");
      return;
    }
    setFeedback(isHelpful);
    toast.success("Thanks for your feedback! 🙏");
  };

  return (
  <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
    {/* Recipe Image */}
    {recipe.image && (
      <div className="w-full aspect-video overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )}
    {/* Header */}
    <div className="bg-primary/10 p-6 border-b border-border">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="space-y-1">
          <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
            Recipe {index + 1}
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground">
            {recipe.name}
          </h3>
        </div>
        <span
          className={`text-xs font-body font-semibold px-3 py-1.5 rounded-full ${difficultyColor[recipe.difficulty] || "bg-muted text-muted-foreground"}`}
        >
          {recipe.difficulty}
        </span>
      </div>
      {recipe.description && (
        <p className="text-sm font-body text-muted-foreground mt-3 leading-relaxed">
          {recipe.description}
        </p>
      )}
      <div className="flex flex-wrap gap-4 mt-4 text-sm font-body text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {recipe.time}
        </span>
        <span className="flex items-center gap-1.5">
          <Flame className="h-4 w-4" /> {recipe.difficulty}
        </span>
      </div>
    </div>

    <div className="p-6 md:p-8 space-y-6">
      {/* Ingredients */}
      <div>
        <h4 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" /> Ingredients
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, j) => (
            <li
              key={j}
              className="text-sm font-body text-muted-foreground flex items-start gap-2"
            >
              <span className="text-primary mt-1">•</span>
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div>
        <h4 className="font-display text-lg font-bold text-foreground mb-4">
          Step-by-Step Instructions
        </h4>
        <div className="space-y-4">
          {recipe.steps.map((step, j) => (
            <div key={j} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-body font-bold">
                {j + 1}
              </div>
              <p className="text-sm font-body text-foreground leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <p className="text-sm font-body text-secondary-foreground">
          <span className="font-semibold">💡 Pro Tip:</span> {recipe.proTip}
        </p>
      </div>

      {/* Serving Suggestion */}
      {recipe.servingSuggestion && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-body text-muted-foreground">
            <span className="font-semibold text-foreground">🍽️ Serving Suggestion:</span>{" "}
            {recipe.servingSuggestion}
          </p>
        </div>
      )}

      {/* Reference Links */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
        {recipe.youtubeSearch && (
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeSearch)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Youtube className="h-4 w-4" /> Watch Video Tutorial
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {recipe.referenceUrl && (
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(recipe.referenceUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Find Recipe Online
          </a>
        )}
      </div>

      {/* Feedback */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <span className="text-sm font-body text-muted-foreground">Was this recipe helpful?</span>
        {feedback === null ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-sm font-body font-medium px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="h-4 w-4" /> Yes
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-sm font-body font-medium px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" /> No
            </button>
          </div>
        ) : (
          <span className="text-sm font-body text-primary font-medium">
            {feedback ? "👍 Glad it helped!" : "Thanks, we'll improve!"}
          </span>
        )}
      </div>
    </div>
  </div>
  );
};
const QUICK_INGREDIENTS = [
  { label: "🍚 Rice", value: "rice" },
  { label: "🫘 Dal", value: "dal" },
  { label: "🥔 Potato", value: "potato" },
  { label: "🧅 Onion", value: "onion" },
  { label: "🍅 Tomato", value: "tomato" },
  { label: "🌶️ Green Chilli", value: "green chilli" },
  { label: "🧄 Garlic", value: "garlic" },
  { label: "🫚 Ginger", value: "ginger" },
  { label: "🥚 Eggs", value: "eggs" },
  { label: "🍗 Chicken", value: "chicken" },
  { label: "🥛 Milk", value: "milk" },
  { label: "🧈 Ghee", value: "ghee" },
  { label: "🫑 Capsicum", value: "capsicum" },
  { label: "🥕 Carrot", value: "carrot" },
  { label: "🍋 Lemon", value: "lemon" },
  { label: "🌿 Coriander", value: "coriander" },
  { label: "🥜 Peanuts", value: "peanuts" },
  { label: "🫛 Paneer", value: "paneer" },
  { label: "🌾 Atta", value: "atta" },
  { label: "🥣 Besan", value: "besan" },
];

const QUICK_EQUIPMENT = [
  { label: "♨️ Pressure Cooker", value: "pressure cooker" },
  { label: "🍳 Tawa", value: "tawa" },
  { label: "🥘 Kadhai", value: "kadhai" },
  { label: "🔥 Gas Stove", value: "gas stove" },
  { label: "🍲 Saucepan", value: "saucepan" },
  { label: "⚡ Mixer Grinder", value: "mixer grinder" },
  { label: "📦 Microwave", value: "microwave" },
  { label: "🫕 Induction", value: "induction" },
  { label: "🥄 Rolling Pin", value: "rolling pin" },
  { label: "🏺 Handi", value: "handi" },
];

const toggleItem = (
  current: string,
  item: string,
  setter: React.Dispatch<React.SetStateAction<string>>
) => {
  const items = current.split(",").map((s) => s.trim()).filter(Boolean);
  if (items.includes(item)) {
    setter(items.filter((i) => i !== item).join(", "));
  } else {
    setter([...items, item].join(", "));
  }
};

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [equipment, setEquipment] = useState("");
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState("30");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedIngredients = ingredients.split(",").map((s) => s.trim()).filter(Boolean);
  const selectedEquipment = equipment.split(",").map((s) => s.trim()).filter(Boolean);

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
        <section className="bg-card rounded-xl shadow-md p-6 md:p-8 space-y-5 border border-border">
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
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_INGREDIENTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleItem(ingredients, item.value, setIngredients)}
                  className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${
                    selectedIngredients.includes(item.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
              What equipment?
            </label>
            <input
              type="text"
              placeholder="pressure cooker, tawa, kadhai..."
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_EQUIPMENT.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleItem(equipment, item.value, setEquipment)}
                  className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${
                    selectedEquipment.includes(item.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
                People to cook for
              </label>
              <select
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-body text-sm font-semibold text-foreground mb-1.5">
                Time available
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-body">
              Cooking up detailed recipes for you...
            </p>
          </div>
        )}

        {/* Results */}
        {recipes.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Your Recipes
              </h2>
              <span className="text-sm font-body text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {recipes.length} recipes
              </span>
            </div>
            <div className="grid gap-8">
              {recipes.map((recipe, i) => (
                <RecipeCard key={i} recipe={recipe} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
