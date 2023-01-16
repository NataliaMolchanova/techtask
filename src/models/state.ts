
export interface UserOptions{
    x: number;
    y: number;
}

export interface RectOptions extends BasicElementOptions{
    size: number;
}

export interface BasicElementOptions {
    x: number;
    y: number;
    color: string;
}

export type ElementOptions = BasicElementOptions | RectOptions;

export interface State {
    users: {
        [userId : string]: UserOptions
    }
    elements: {
        [elementId : string]: ElementOptions
    }
}