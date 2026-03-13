declare const bootstrap: any;

import { pantry } from "./domain/pantry";
import { Recipe } from "./domain/recipe";
import { createRecipe, type RecipeType } from "./services/recipefactory";
import { StorageService } from "./storage/storageService";
import type { Ingredient, Nutrition } from "./models/types";

let currentRecipe: Recipe | null = null;
let selectedSavedRecipeId: string | null = null;

function getElementByIdOrThrow<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element with id "${id}"`);
    }
    return element as T;
}

const recipeNameInput = getElementByIdOrThrow<HTMLInputElement>("recipeName");
const recipeTypeSelect = getElementByIdOrThrow<HTMLSelectElement>("recipeType");

const pantryBody = getElementByIdOrThrow<HTMLTableSectionElement>("pantryBody");
const recipeBody = getElementByIdOrThrow<HTMLTableSectionElement>("recipeBody");

const currentRecipeTitle = getElementByIdOrThrow<HTMLElement>("currentRecipeTitle");

const totalCalories = getElementByIdOrThrow<HTMLElement>("totalCalories");
const totalProtein = getElementByIdOrThrow<HTMLElement>("totalProtein");
const totalCarbs = getElementByIdOrThrow<HTMLElement>("totalCarbs");
const totalFat = getElementByIdOrThrow<HTMLElement>("totalFat");

const clearFormBtn = getElementByIdOrThrow<HTMLButtonElement>("clearFormBtn");
const saveRecipeBtn = getElementByIdOrThrow<HTMLButtonElement>("saveRecipeBtn");
const loadRecipeBtn = getElementByIdOrThrow<HTMLButtonElement>("loadRecipeBtn");

const savedRecipesList = getElementByIdOrThrow<HTMLElement>("savedRecipesList");
const detailRecipeName = getElementByIdOrThrow<HTMLElement>("detailRecipeName");
const detailRecipeTypeBadge = getElementByIdOrThrow<HTMLElement>("detailRecipeTypeBadge");
const detailRecipeBody = getElementByIdOrThrow<HTMLTableSectionElement>("detailRecipeBody");
const detailTotalCalories = getElementByIdOrThrow<HTMLElement>("detailTotalCalories");
const detailMacros = getElementByIdOrThrow<HTMLElement>("detailMacros");
const backToSavedRecipesBtn = getElementByIdOrThrow<HTMLButtonElement>("backToSavedRecipesBtn");
const loadSelectedRecipeBtn = getElementByIdOrThrow<HTMLButtonElement>("loadSelectedRecipeBtn");

function isRecipeType(value: string): value is RecipeType {
    return (
        value === "regular" ||
        value === "vegetarian" ||
        value === "lowCarb" ||
        value === "highProtein"
    );
}

function getSelectedRecipeType(): RecipeType {
    const value = recipeTypeSelect.value;
    return isRecipeType(value) ? value : "regular";
}

function showToast(message: string, isError: boolean = false): void {
    const container = getElementByIdOrThrow<HTMLElement>("toastContainer");

    const toast = document.createElement("div");
    toast.className = isError
        ? "alert alert-danger shadow mb-2"
        : "alert alert-info shadow mb-2";

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}

function getRecipeTypeLabel(type: string): string {
    switch (type) {
        case "vegetarian":
        return "Vegetarian";
        case "lowCarb":
        return "Low Carb";
        case "highProtein":
        return "High Protein";
        default:
        return "Regular";
    }
}

function getRecipeTypeBadgeClass(type: string): string {
    switch (type) {
        case "vegetarian":
            return "bg-success";
        case "lowCarb":
            return "bg-warning text-dark";
        case "highProtein":
            return "bg-primary";
        default:
            return "bg-secondary";
    }
}

function scaleNutrition(ingredient: Ingredient, grams: number): Nutrition {
    const factor = grams / 100;
    return {
        calories: ingredient.nutritionPer100g.calories * factor,
        protein: ingredient.nutritionPer100g.protein * factor,
        carbs: ingredient.nutritionPer100g.carbs * factor,
        fat: ingredient.nutritionPer100g.fat * factor
    };
}

function findIngredientById(id: string): Ingredient | undefined {
    return pantry.find((ingredient) => ingredient.id === id);
}

function renderPantry(): void {
    pantryBody.innerHTML = "";

    for (const ingredient of pantry) {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${ingredient.name}</td>
        <td><span class="badge text-bg-light border">${ingredient.category}</span></td>
        <td>${ingredient.nutritionPer100g.calories}</td>
        <td>${ingredient.nutritionPer100g.protein}</td>
        <td>${ingredient.nutritionPer100g.carbs}</td>
        <td>${ingredient.nutritionPer100g.fat}</td>
        <td>
            <button
            class="btn btn-outline-primary btn-sm add-ingredient-btn"
            data-ingredient-id="${ingredient.id}"
            type="button"
            >
            Add
            </button>
        </td>
        `;
        pantryBody.appendChild(row);
    }
}

function renderRecipe(): void {
    recipeBody.innerHTML = "";

    if (!currentRecipe) {
        currentRecipeTitle.textContent = "Current Recipe";
        return;
    }

    currentRecipeTitle.textContent = currentRecipe.name || "Current Recipe";

    if (currentRecipe.items.length === 0) {
        recipeBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-5">
            No ingredients yet. Add items from the pantry.
            </td>
        </tr>
        `;
        return;
    }

    for (const item of currentRecipe.items) {
        const totals = scaleNutrition(item.ingredient, item.grams);

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${item.ingredient.name}</td>
        <td>
            <input
            type="number"
            min="0"
            step="1"
            class="form-control form-control-sm grams-input"
            data-ingredient-id="${item.ingredient.id}"
            value="${item.grams}"
            />
        </td>
        <td>${totals.calories.toFixed(1)}</td>
        <td>${totals.protein.toFixed(1)}</td>
        <td>${totals.carbs.toFixed(1)}</td>
        <td>${totals.fat.toFixed(1)}</td>
        <td>
            <button
            class="btn btn-outline-danger btn-sm remove-ingredient-btn"
            data-ingredient-id="${item.ingredient.id}"
            type="button"
            >
            Remove
            </button>
        </td>
        `;
        recipeBody.appendChild(row);
    }
}

function renderTotals(): void {
    const totals: Nutrition = currentRecipe
        ? currentRecipe.getTotals()
        : { calories: 0, protein: 0, carbs: 0, fat: 0 };

    totalCalories.textContent = totals.calories.toFixed(1);
    totalProtein.textContent = totals.protein.toFixed(1);
    totalCarbs.textContent = totals.carbs.toFixed(1);
    totalFat.textContent = totals.fat.toFixed(1);
}

function renderAll(): void {
    renderRecipe();
    renderTotals();
}

function handleRecipeTypeChange(): void {
    const recipeType = getSelectedRecipeType();
    const recipeName = recipeNameInput.value.trim();

    currentRecipe = createRecipe(recipeType, crypto.randomUUID(), recipeName);
    renderAll();
    showToast(`Recipe type changed to ${getRecipeTypeLabel(recipeType)}.`);
}

function clearForm(): void {
    recipeNameInput.value = "";
    recipeTypeSelect.value = "regular";
    currentRecipe = createRecipe("regular", crypto.randomUUID(), "");
    renderAll();
    showToast("Form cleared.");
}

function handlePantryClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest(".add-ingredient-btn");
    if (!(button instanceof HTMLButtonElement)) return;

    if (!currentRecipe) {
        showToast("No active recipe.", true);
        return;
    }

    const ingredientId = button.dataset.ingredientId;
    if (!ingredientId) return;

    const ingredient = findIngredientById(ingredientId);
    if (!ingredient) {
        showToast("Ingredient not found.", true);
        return;
    }

    try {
        currentRecipe.addIngredient(ingredient, 100);
        renderAll();
        showToast(`Added ${ingredient.name}.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add ingredient.";
        showToast(message, true);
    }
}

function handleRecipeClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const button = target.closest(".remove-ingredient-btn");
    if (!(button instanceof HTMLButtonElement)) return;

    if (!currentRecipe) return;

    const ingredientId = button.dataset.ingredientId;
    if (!ingredientId) return;

    currentRecipe.removeIngredient(ingredientId);
    renderAll();
    showToast("Ingredient removed.");
}

function handleRecipeInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains("grams-input")) return;
    if (!currentRecipe) return;

    const ingredientId = target.dataset.ingredientId;
    if (!ingredientId) return;

    const grams = Number(target.value);
    if (!Number.isFinite(grams) || grams < 0) {
        showToast("Please enter a valid grams value.", true);
        return;
    }

    currentRecipe.updateIngredient(ingredientId, grams);
    renderAll();
}

async function handleSave(): Promise<void> {
    if (!currentRecipe) {
        showToast("No recipe to save.", true);
        return;
    }

    const recipeName = recipeNameInput.value.trim();
    currentRecipe.name = recipeName;

    if (recipeName === "") {
        showToast("Please enter a recipe name before saving.", true);
        return;
    }

    try {
        await StorageService.saveRecipe(currentRecipe);
        renderAll();
        showToast("Recipe saved.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save recipe.";
        showToast(message, true);
    }
}

function renderSavedRecipesList(recipes: Recipe[]): void {
    savedRecipesList.innerHTML = "";

    if (recipes.length === 0) {
        savedRecipesList.innerHTML = `<p class="text-muted mb-0">No saved recipes yet.</p>`;
        return;
    }

    for (const recipe of recipes) {
        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center border-bottom py-3";

        row.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold">${recipe.name || "Untitled Recipe"}</span>
            <span class="badge ${getRecipeTypeBadgeClass(recipe.type)}">
            ${getRecipeTypeLabel(recipe.type)}
            </span>
        </div>
        <button
            type="button"
            class="btn btn-outline-primary btn-sm view-saved-recipe-btn"
            data-recipe-id="${recipe.id}"
        >
            View
        </button>
        `;

        savedRecipesList.appendChild(row);
    }
}

function renderRecipeDetails(recipe: Recipe): void {
    selectedSavedRecipeId = recipe.id;

    detailRecipeName.textContent = recipe.name || "Untitled Recipe";
    detailRecipeTypeBadge.textContent = getRecipeTypeLabel(recipe.type);
    detailRecipeTypeBadge.className = `badge ${getRecipeTypeBadgeClass(recipe.type)}`;

    detailRecipeBody.innerHTML = "";

    for (const item of recipe.items) {
        const calories = (item.ingredient.nutritionPer100g.calories * item.grams) / 100;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${item.ingredient.name}</td>
        <td>${item.grams}g</td>
        <td>${calories.toFixed(1)} cal</td>
        `;
        detailRecipeBody.appendChild(row);
    }

    const totals = recipe.getTotals();
    detailTotalCalories.textContent = `${totals.calories.toFixed(1)} cal`;
    detailMacros.textContent =
        `${totals.protein.toFixed(1)}g / ${totals.carbs.toFixed(1)}g / ${totals.fat.toFixed(1)}g`;
}

async function handleLoad(): Promise<void> {
    try {
        const recipes = await StorageService.getAllRecipes();
        renderSavedRecipesList(recipes);

        const modalElement = document.getElementById("savedRecipesModal");
        if (!modalElement) return;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to open saved recipes.";
        showToast(message, true);
    }
}

function initializeDefaultRecipe(): void {
    currentRecipe = createRecipe("regular", crypto.randomUUID(), "");
    recipeNameInput.value = "";
    renderAll();
}

function setupEventListeners(): void {
    recipeTypeSelect.addEventListener("change", handleRecipeTypeChange);
    clearFormBtn.addEventListener("click", clearForm);
    pantryBody.addEventListener("click", handlePantryClick);
    recipeBody.addEventListener("click", handleRecipeClick);
    recipeBody.addEventListener("input", handleRecipeInput);
    saveRecipeBtn.addEventListener("click", () => void handleSave());
    loadRecipeBtn.addEventListener("click", () => void handleLoad());

    savedRecipesList.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const button = target.closest(".view-saved-recipe-btn");
        if (!(button instanceof HTMLButtonElement)) return;

        const recipeId = button.dataset.recipeId;
        if (!recipeId) return;

        try {
        const recipe = await StorageService.loadRecipe(recipeId);
        renderRecipeDetails(recipe);

        const savedModalElement = document.getElementById("savedRecipesModal");
        const detailModalElement = document.getElementById("recipeDetailModal");
        if (!savedModalElement || !detailModalElement) return;

        bootstrap.Modal.getInstance(savedModalElement)?.hide();
        new bootstrap.Modal(detailModalElement).show();
        } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to view recipe.";
        showToast(message, true);
        }
    });

    backToSavedRecipesBtn.addEventListener("click", () => {
        const savedModalElement = document.getElementById("savedRecipesModal");
        const detailModalElement = document.getElementById("recipeDetailModal");
        if (!savedModalElement || !detailModalElement) return;

        bootstrap.Modal.getInstance(detailModalElement)?.hide();
        new bootstrap.Modal(savedModalElement).show();
    });

    loadSelectedRecipeBtn.addEventListener("click", async () => {
        if (!selectedSavedRecipeId) return;

        try {
        currentRecipe = await StorageService.loadRecipe(selectedSavedRecipeId);
        recipeNameInput.value = currentRecipe.name;
        recipeTypeSelect.value = currentRecipe.type;
        renderAll();

        const detailModalElement = document.getElementById("recipeDetailModal");
        if (detailModalElement) {
            bootstrap.Modal.getInstance(detailModalElement)?.hide();
        }

        showToast(`Loaded recipe "${currentRecipe.name}".`);
        } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load recipe.";
        showToast(message, true);
        }
    });
}

function init(): void {
    renderPantry();
    initializeDefaultRecipe();
    setupEventListeners();
}

document.addEventListener("DOMContentLoaded", init);