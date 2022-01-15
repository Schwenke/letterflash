export interface BoardState {
    words: Word[];
}

export interface Word {
    letters: Letter[];
}

export interface Letter {
    letter: string;
    perfect: boolean;
    partial: boolean;
    committed: boolean;
}