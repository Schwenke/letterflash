export interface Keyboard {
    rows: KeyboardRow[];
}

export interface KeyboardRow {
    keys: Key[];
    index: number;
}

export interface Key {
    letter: string;
    guessed: boolean;
    correct: boolean;
}