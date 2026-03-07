import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Youtube, ChefHat, Clock, Flame, ThumbsUp, ThumbsDown, Users, Leaf, WheatOff } from "lucide-react";
import { toast } from "sonner";
import type { Recipe } from "@/pages/Index";
import type { Roommate } from "@/types/roommate";

const difficultyColor: Record<string, string> = {
  Easy: "bg-accent text-accent-foreground",
  Medium: "bg-warm-gold text-warm-gold-foreground",
  Hard: "bg-primary text-primary-foreground",
};

interface Props {
  recipe: Recipe;
  index: number;
  compatibleRoommates: Roommate[];
  totalActiveRoommates: number;
}

const RecipeCard = ({ recipe, index, compatibleRoommates, totalActiveRoommates }: Props) => {
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
      {/* Compatibility banner */}
      {totalActiveRoommates > 0 && (
        <div
          className={`px-6 py-2.5 flex items-center gap-2 text-sm font-body font-medium ${
            compatibleRoommates.length === totalActiveRoommates
              ? "bg-accent/20 text-accent-foreground"
              : compatibleRoommates.length > 0
              ? "bg-warm-gold/20 text-warm-gold-foreground"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          <Users className="h-4 w-4" />
          {compatibleRoommates.length === totalActiveRoommates ? (
            <span>✅ Works for everyone!</span>
          ) : compatibleRoommates.length > 0 ? (
            <span>
              Can be made for {compatibleRoommates.map((r) => r.name).join(", ")} ({compatibleRoommates.length}/{totalActiveRoommates} roommates)
            </span>
          ) : (
            <span>⚠️ May not suit any active roommate's preferences</span>
          )}
        </div>
      )}

      {/* Recipe Image */}
      {recipe.image && (
        <div className="w-full aspect-video overflow-hidden">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      {/* Header */}
      <div className="bg-primary/10 p-6 border-b border-border">
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div className="space-y-1">
            <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
              Recipe {index + 1}
            </span>
            <h3 className="font-display text-2xl font-bold text-foreground">{recipe.name}</h3>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {recipe.isVegetarian && (
              <span className="inline-flex items-center gap-1 text-xs font-body font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                <Leaf className="h-3.5 w-3.5" /> Veg
              </span>
            )}
            {recipe.isGlutenFree && (
              <span className="inline-flex items-center gap-1 text-xs font-body font-medium px-2.5 py-1 rounded-full bg-warm-gold text-warm-gold-foreground">
                <WheatOff className="h-3.5 w-3.5" /> GF
              </span>
            )}
            <span className={`text-xs font-body font-semibold px-3 py-1.5 rounded-full ${difficultyColor[recipe.difficulty] || "bg-muted text-muted-foreground"}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
        {recipe.description && (
          <p className="text-sm font-body text-muted-foreground mt-3 leading-relaxed">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-sm font-body text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {recipe.time}</span>
          <span className="flex items-center gap-1.5"><Flame className="h-4 w-4" /> {recipe.difficulty}</span>
          {recipe.spiceLevel && (
            <span className="flex items-center gap-1.5">
              🌶️ {recipe.spiceLevel}
            </span>
          )}
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
              <li key={j} className="text-sm font-body text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>{ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h4 className="font-display text-lg font-bold text-foreground mb-4">Step-by-Step Instructions</h4>
          <div className="space-y-6">
            {recipe.steps.map((step, j) => (
              <div key={j} className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-body font-bold">{j + 1}</div>
                  <p className="text-sm font-body text-foreground leading-relaxed pt-1">{step}</p>
                </div>
                {recipe.stepImages?.[j] && (
                  <div className="ml-12 rounded-lg overflow-hidden border border-border">
                    <img src={recipe.stepImages[j]!} alt={`Step ${j + 1}`} className="w-full max-h-64 object-cover" loading="lazy" />
                  </div>
                )}
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
              <span className="font-semibold text-foreground">🍽️ Serving Suggestion:</span> {recipe.servingSuggestion}
            </p>
          </div>
        )}

        {/* Reference Links */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          {recipe.youtubeSearch && (
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeSearch)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors">
              <Youtube className="h-4 w-4" /> Watch Video Tutorial <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {recipe.referenceUrl && (
            <a href={`https://www.google.com/search?q=${encodeURIComponent(recipe.referenceUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors">
              <ExternalLink className="h-4 w-4" /> Find Recipe Online
            </a>
          )}
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <span className="text-sm font-body text-muted-foreground">Was this recipe helpful?</span>
          {feedback === null ? (
            <div className="flex gap-2">
              <button onClick={() => handleFeedback(true)} disabled={submitting} className="inline-flex items-center gap-1.5 text-sm font-body font-medium px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                <ThumbsUp className="h-4 w-4" /> Yes
              </button>
              <button onClick={() => handleFeedback(false)} disabled={submitting} className="inline-flex items-center gap-1.5 text-sm font-body font-medium px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
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

export default RecipeCard;
