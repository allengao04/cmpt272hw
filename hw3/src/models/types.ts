type IngredientId = string

type Category = "protein" | "vegetable" | "grain" | "dairy" | "spice" | "fruit" | "fat" | "meat" | "other"

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface Ingredient {
    id: IngredientId;
    name: string;
    nutritionPer100g: Nutrition;
    category: Category;
}

export interface RecipeItem {
    ingredient: Ingredient;
    grams: number;
}



