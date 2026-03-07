import { useState } from "react";
import { Roommate, DEFAULT_PREFERENCES, DietaryPreferences } from "@/types/roommate";
import { Plus, X, Leaf, WheatOff, Flame, ChefHat, Users } from "lucide-react";

const SPICY_LABELS: Record<DietaryPreferences["spicyLevel"], { label: string; icon: string }> = {
  none: { label: "No spice", icon: "🚫" },
  mild: { label: "Mild", icon: "🌶️" },
  medium: { label: "Medium", icon: "🌶️🌶️" },
  hot: { label: "Hot", icon: "🌶️🌶️🌶️" },
};

interface Props {
  roommates: Roommate[];
  onChange: (roommates: Roommate[]) => void;
}

const RoommateManager = ({ roommates, onChange }: Props) => {
  const [newName, setNewName] = useState("");

  const addRoommate = () => {
    const name = newName.trim();
    if (!name) return;
    onChange([
      ...roommates,
      {
        id: crypto.randomUUID(),
        name,
        preferences: { ...DEFAULT_PREFERENCES },
        wantsToCook: true,
      },
    ]);
    setNewName("");
  };

  const removeRoommate = (id: string) => {
    onChange(roommates.filter((r) => r.id !== id));
  };

  const updatePreference = (id: string, update: Partial<DietaryPreferences>) => {
    onChange(
      roommates.map((r) =>
        r.id === id ? { ...r, preferences: { ...r.preferences, ...update } } : r
      )
    );
  };

  const toggleCook = (id: string) => {
    onChange(
      roommates.map((r) =>
        r.id === id ? { ...r, wantsToCook: !r.wantsToCook } : r
      )
    );
  };

  const activeCount = roommates.filter((r) => r.wantsToCook).length;

  return (
    <section className="bg-card rounded-xl shadow-md p-6 md:p-8 space-y-5 border border-border">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Roommate Preferences
        </h2>
        {roommates.length > 0 && (
          <span className="text-xs font-body bg-muted text-muted-foreground px-2.5 py-1 rounded-full ml-auto">
            {activeCount}/{roommates.length} cooking
          </span>
        )}
      </div>

      {/* Add roommate */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRoommate()}
          placeholder="Add a roommate..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={30}
        />
        <button
          onClick={addRoommate}
          disabled={!newName.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2.5 font-body text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Roommate list */}
      {roommates.length > 0 && (
        <div className="space-y-3">
          {roommates.map((rm) => (
            <div
              key={rm.id}
              className={`rounded-lg border p-4 transition-colors ${
                rm.wantsToCook
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => toggleCook(rm.id)}
                    title={rm.wantsToCook ? "Cooking today!" : "Not cooking"}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                      rm.wantsToCook
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <ChefHat className="h-4 w-4" />
                  </button>
                  <span className="font-body font-semibold text-foreground truncate">
                    {rm.name}
                  </span>
                </div>
                <button
                  onClick={() => removeRoommate(rm.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Dietary toggles */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    updatePreference(rm.id, { vegetarian: !rm.preferences.vegetarian })
                  }
                  className={`inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    rm.preferences.vegetarian
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                  }`}
                >
                  <Leaf className="h-3.5 w-3.5" /> Vegetarian
                </button>
                <button
                  onClick={() =>
                    updatePreference(rm.id, { glutenFree: !rm.preferences.glutenFree })
                  }
                  className={`inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    rm.preferences.glutenFree
                      ? "bg-warm-gold text-warm-gold-foreground border-warm-gold"
                      : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                  }`}
                >
                  <WheatOff className="h-3.5 w-3.5" /> Gluten-Free
                </button>

                {/* Spicy selector */}
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                  {(Object.keys(SPICY_LABELS) as DietaryPreferences["spicyLevel"][]).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() => updatePreference(rm.id, { spicyLevel: level })}
                        className={`text-xs font-body px-2 py-1 rounded-full border transition-colors ${
                          rm.preferences.spicyLevel === level
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {SPICY_LABELS[level].label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {roommates.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-body text-muted-foreground">
            <span className="font-semibold text-foreground">📋 Summary:</span>{" "}
            {roommates.filter((r) => r.preferences.vegetarian).length > 0 && (
              <span className="inline-flex items-center gap-1 mr-2">
                <Leaf className="h-3.5 w-3.5 text-accent" />
                {roommates.filter((r) => r.preferences.vegetarian).map((r) => r.name).join(", ")} — vegetarian
              </span>
            )}
            {roommates.filter((r) => r.preferences.glutenFree).length > 0 && (
              <span className="inline-flex items-center gap-1 mr-2">
                <WheatOff className="h-3.5 w-3.5 text-warm-gold" />
                {roommates.filter((r) => r.preferences.glutenFree).map((r) => r.name).join(", ")} — gluten-free
              </span>
            )}
            {activeCount === 0 && "No one's cooking today! Toggle the chef hat to join."}
            {activeCount > 0 && (
              <span className="block mt-1">
                🍳 Cooking today: {roommates.filter((r) => r.wantsToCook).map((r) => r.name).join(", ")}
              </span>
            )}
          </p>
        </div>
      )}

      {roommates.length === 0 && (
        <p className="text-sm font-body text-muted-foreground text-center py-4">
          Add roommates to personalize recipe recommendations for everyone 🏠
        </p>
      )}
    </section>
  );
};

export default RoommateManager;
