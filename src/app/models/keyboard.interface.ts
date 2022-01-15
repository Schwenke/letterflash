export interface KeyBoard {
    rows: KeyBoardRow[];
}

export interface KeyBoardRow {
    keys: Key[];
    index: number;
}

export interface Key {
    letter: string;
    guessed: boolean;
    correct: boolean;
}