import { Recipe } from "./recipe";
import type { RecipeType } from "../services/recipefactory";

export class HighProteinRecipe extends Recipe {
    minProteinRatio = 0.3;
  
    override getWarnings(): string[] {
      const totals = this.getTotals();
      const warnings: string[] = [];
  
      if (totals.calories > 0) {
        const ratio = (totals.protein * 4) / totals.calories;
        if (ratio < this.minProteinRatio) {
          warnings.push("This recipe does not meet the high-protein target.");
        }
      }
  
      return warnings;
    }

    override get type(): RecipeType {
      return "lowCarb";
    }
  }