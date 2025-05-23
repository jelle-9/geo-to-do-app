export interface Task {
    id: number;
    title: string;
    description: string | null;
    is_done: boolean;
    created_at: string;
    updated_at: string;
    latitude?: number;
    longitude?: number;
    // TODO: Geo-Daten hinzufügen
    latitude?: number | null;
    longitude?: number | null;
}