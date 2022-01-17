export interface BoardState {
    words: Word[];

    //  Grid indexes
    rowIndex: number;
    columnIndex: number;

    //  Game State
    secretWord: string;
    previousGuesses: string[];
    success: boolean;
    failure: boolean;
    error: string;
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