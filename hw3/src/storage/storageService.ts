import { Recipe } from "../domain/recipe";
import { createRecipe, type RecipeType } from "../services/recipefactory";

const STORAGE_KEY = "savedRecipes";

type SavedRecipeData = {
  id: string;
  name: string;
  type: RecipeType;
  items: {
    ingredient: any;
    grams: number;
  }[];
};

export class StorageService {
  static async saveRecipe(recipe: Recipe): Promise<void> {
    const all = await this.getRawRecipes();

    const data: SavedRecipeData = {
      id: recipe.id,
      name: recipe.name,
      type: recipe.type as RecipeType,
      items: recipe.items
    };

    const existingIndex = all.findIndex(r => r.id === recipe.id);

    if (existingIndex >= 0) {
      all[existingIndex] = data;
    } else {
      all.push(data);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  static async getAllRecipes(): Promise<Recipe[]> {
    const raw = await this.getRawRecipes();

    return raw.map((parsed) => {
      const recipe = createRecipe(parsed.type, parsed.id, parsed.name);
      for (const item of parsed.items) {
        recipe.addIngredient(item.ingredient, item.grams);
      }
      return recipe;
    });
  }

  static async loadRecipe(recipeId: string): Promise<Recipe> {
    const raw = await this.getRawRecipes();
    const parsed = raw.find(r => r.id === recipeId);

    if (!parsed) {
      throw new Error("Recipe not found");
    }

    const recipe = createRecipe(parsed.type, parsed.id, parsed.name);
    for (const item of parsed.items) {
      recipe.addIngredient(item.ingredient, item.grams);
    }

    return recipe;
  }

  private static async getRawRecipes(): Promise<SavedRecipeData[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as SavedRecipeData[];
  }
}