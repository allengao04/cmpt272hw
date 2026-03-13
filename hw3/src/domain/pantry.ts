import type { Ingredient } from "../models/types";

export const pantry: Ingredient[] = [
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6
    },
    category: "meat"
  },
  {
    id: "tofu",
    name: "Tofu",
    nutritionPer100g: {
      calories: 76,
      protein: 8,
      carbs: 1.9,
      fat: 4.8
    },
    category: "protein"
  },
  {
    id: "cooked-rice",
    name: "Cooked Rice",
    nutritionPer100g: {
      calories: 130,
      protein: 2.4,
      carbs: 28.2,
      fat: 0.3
    },
    category: "grain"
  },
  {
    id: "milk-2-percent",
    name: "Milk (2%)",
    nutritionPer100g: {
      calories: 50,
      protein: 3.4,
      carbs: 5,
      fat: 2
    },
    category: "dairy"
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100
    },
    category: "fat"
  },
  {
    id: "broccoli",
    name: "Broccoli",
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbs: 6.6,
      fat: 0.4
    },
    category: "vegetable"
  },
  {
    id: "banana",
    name: "Banana",
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3
    },
    category: "fruit"
  },
  {
    id: "almonds",
    name: "Almonds",
    nutritionPer100g: {
      calories: 579,
      protein: 21.2,
      carbs: 21.6,
      fat: 49.9
    },
    category: "fat"
  },
  {
    id: "eggs",
    name: "Eggs",
    nutritionPer100g: {
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11
    },
    category: "protein"
  },
  {
    id: "sugar",
    name: "Sugar",
    nutritionPer100g: {
      calories: 387,
      protein: 0,
      carbs: 100,
      fat: 0
    },
    category: "other"
  }
];