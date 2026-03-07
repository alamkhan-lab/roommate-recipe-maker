import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Youtube, ChefHat, Clock, Flame, ThumbsUp, ThumbsDown, Users, Leaf, WheatOff } from "lucide-react";
import { toast } from "sonner";
import RoommateManager from "@/components/RoommateManager";
import { Roommate } from "@/types/roommate";
import RecipeCard from "@/components/RecipeCard";

export interface Recipe {
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
  stepImages?: (string | null)[];
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: "none" | "mild" | "medium" | "hot";
}

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

function getCompatibleRoommates(recipe: Recipe, roommates: Roommate[]): Roommate[] {
  const active = roommates.filter((r) => r.wantsToCook);
  return active.filter((rm) => {
    if (rm.preferences.vegetarian && !recipe.isVegetarian) return false;
    if (rm.preferences.glutenFree && !recipe.isGlutenFree) return false;
    if (rm.preferences.spicyLevel === "none" && recipe.spiceLevel && recipe.spiceLevel !== "none") return false;
    if (rm.preferences.spicyLevel === "mild" && (recipe.spiceLevel === "hot")) return false;
    return true;
  });
}

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [equipment, setEquipment] = useState("");
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState("30");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  const selectedIngredients = ingredients.split(",").map((s) => s.trim()).filter(Boolean);
  const selectedEquipment = equipment.split(",").map((s) => s.trim()).filter(Boolean);
  const activeRoommates = roommates.filter((r) => r.wantsToCook);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setError("Please enter at least some ingredients.");
      return;
    }
    setError("");
    setLoading(true);
    setRecipes([]);

    // Build dietary context from active roommates
    const dietaryNotes: string[] = [];
    if (activeRoommates.some((r) => r.preferences.vegetarian)) {
      dietaryNotes.push("Some roommates are vegetarian — include vegetarian options");
    }
    if (activeRoommates.some((r) => r.preferences.glutenFree)) {
      dietaryNotes.push("Some roommates need gluten-free options");
    }
    const spicyPrefs = activeRoommates.map((r) => r.preferences.spicyLevel);
    if (spicyPrefs.includes("none")) {
      dietaryNotes.push("Some roommates prefer no spice at all");
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-recipes",
        {
          body: {
            ingredients: ingredients.trim(),
            equipment: equipment.trim() || "basic kitchen setup",
            time: parseInt(time),
            people: activeRoommates.length > 0 ? activeRoommates.length : people,
            dietaryNotes: dietaryNotes.length > 0 ? dietaryNotes.join(". ") : undefined,
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
        {/* Roommate Preferences */}
        <RoommateManager roommates={roommates} onChange={setRoommates} />

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
                value={activeRoommates.length > 0 ? activeRoommates.length : people}
                onChange={(e) => setPeople(Number(e.target.value))}
                disabled={activeRoommates.length > 0}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
              {activeRoommates.length > 0 && (
                <p className="text-xs font-body text-muted-foreground mt-1">
                  Auto-set from active roommates
                </p>
              )}
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
              {recipes.map((recipe, i) => {
                const compatible = activeRoommates.length > 0
                  ? getCompatibleRoommates(recipe, roommates)
                  : [];
                return (
                  <RecipeCard
                    key={i}
                    recipe={recipe}
                    index={i}
                    compatibleRoommates={compatible}
                    totalActiveRoommates={activeRoommates.length}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
