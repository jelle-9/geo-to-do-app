export interface Task {
    id: number;
    title: string;
    description: string | null;
    is_done: boolean;
    created_at: string;
    updated_at: string;
    // TODO: Geo-Daten hinzufügen
}