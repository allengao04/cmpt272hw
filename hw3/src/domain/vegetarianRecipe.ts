import { Recipe } from "./recipe";
import type { Ingredient } from "../models/types";
import type { RecipeType } from "../services/recipefactory";

export class VegetarianRecipe extends Recipe {
    override get type(): RecipeType {
        return "vegetarian";
      }

    override addIngredient(ingredient: Ingredient, grams: number) {
        console.log("I am called");
        if (ingredient.category === "meat") {
            throw new Error("Vegetarian recipes cannot contain meat");
        }

        super.addIngredient(ingredient, grams);
    }

}