export interface DietaryPreferences {
  vegetarian: boolean;
  glutenFree: boolean;
  spicyLevel: "none" | "mild" | "medium" | "hot";
}

export interface Roommate {
  id: string;
  name: string;
  preferences: DietaryPreferences;
  wantsToCook: boolean;
}

export const DEFAULT_PREFERENCES: DietaryPreferences = {
  vegetarian: false,
  glutenFree: false,
  spicyLevel: "medium",
};
