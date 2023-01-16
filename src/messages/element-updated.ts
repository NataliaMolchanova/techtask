export interface RectChangesMap {
    size?: number;
}

export interface ElementChangesMap {
    x?: number;
    y?: number;
    color?: string;
}

export enum ElementType {
    RECT = "rect"
}

export interface ElementUpdated {
    docId: string;
    elementId: string;
    type: ElementType
    changesMap: ElementChangesMap;
}