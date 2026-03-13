import type { Ingredient, RecipeItem, Nutrition } from "../models/types";
import type { RecipeType } from "../services/recipefactory";

export class Recipe {
  id: string;
  name: string;
  items: RecipeItem[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.items = [];
  }

  addIngredient(ingredient: Ingredient, grams: number) {
    this.items.push({ ingredient, grams });
  }

  get type(): RecipeType {
    return "regular";
  }

  removeIngredient(ingredientId: string) {
    this.items = this.items.filter(
      item => item.ingredient.id !== ingredientId
    );
  }

  updateIngredient(ingredientId: string, grams: number) {
    const item = this.items.find(
      item => item.ingredient.id === ingredientId
    );

    if (item) {
      item.grams = grams;
    }
  }

  getTotals(): Nutrition {
    let totals: Nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    for (const item of this.items) {
      const factor = item.grams / 100;

      totals.calories += item.ingredient.nutritionPer100g.calories * factor;
      totals.protein += item.ingredient.nutritionPer100g.protein * factor;
      totals.carbs += item.ingredient.nutritionPer100g.carbs * factor;
      totals.fat += item.ingredient.nutritionPer100g.fat * factor;
    }
    return totals;
  }

  getWarnings(): string[] {
    return [];
  }
}