
import { Recipe } from "./recipe";
import type { RecipeType } from "../services/recipefactory";


export class LowCarbRecipe extends Recipe {
    maxCarbs = 50;
  
    override getWarnings(): string[] {
      const warnings: string[] = [];
      if (this.getTotals().carbs > this.maxCarbs) {
        warnings.push("This recipe exceeds the low-carb limit.");
      }
      return warnings;
    }

    override get type(): RecipeType {
      return "highProtein";
    }
  }