export interface Suggestion {
    id: number;
    name: string;
}

export interface Recipe {
    id: number;
    title: string;
    image: string;
    summary: string;
    readyInMinutes: number;
    servings: number;
}