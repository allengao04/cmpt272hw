import { Recipe } from "../domain/recipe";
import { VegetarianRecipe } from "../domain/vegetarianRecipe";
import { LowCarbRecipe } from "../domain/lowCarbRecipe";
import { HighProteinRecipe } from "../domain/highProteinRecipe";

export type RecipeType =
  | "regular"
  | "vegetarian"
  | "lowCarb"
  | "highProtein";

export function createRecipe(type: RecipeType, id: string, name:string): Recipe{
    switch (type) {
        case "vegetarian":
          return new VegetarianRecipe(id, name);
    
        case "lowCarb":
          return new LowCarbRecipe(id, name);
    
        case "highProtein":
          return new HighProteinRecipe(id, name);
    
        default:
          return new Recipe(id, name);
    }
}


