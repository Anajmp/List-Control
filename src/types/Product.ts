export interface Product{
    id: string;
    title: string;
    qtd: number;
    completed: boolean;
    createdAt: string;
}

export type FilterType = "todas" | "pendentes" | "concluidas";