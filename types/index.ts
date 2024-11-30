export interface Suggestion {
    id: number;
    name: string;
}

export interface RecipeDetail {
    id: number;
    title: string;
    image: string;
    imageType: string;
    summary: string;
    instructions: string;
    readyInMinutes: number;
    servings: number;
    sourceUrl: string;
    spoonacularSourceUrl: string;
    analyzedInstructions: AnalyzedInstruction[];
    extendedIngredients: ExtendedIngredient[];
}

export interface AnalyzedInstruction {
    name: string;
    steps: Step[];
}

export interface Step {
    number: number;
    step: string;
    ingredients: IngredientReference[];
    equipment: EquipmentReference[];
}

export interface IngredientReference {
    id: number;
    name: string;
    image: string;
}

export interface EquipmentReference {
    id: number;
    name: string;
    image: string;
}

export interface ExtendedIngredient {
    id: number;
    aisle: string;
    image: string;
    consistency: string;
    name: string;
    original: string;
    originalName: string;
    amount: number;
    unit: string;
    meta: string[];
    measures: Measures;
}

export interface Measures {
    us: MeasureUnit;
    metric: MeasureUnit;
}

export interface MeasureUnit {
    amount: number;
    unitShort: string;
    unitLong: string;
}