export interface BoardState {
    words: Word[];

    //  Grid indexes
    rowIndex: number;
    columnIndex: number;

    //  Game State
    gameStatus: GameStatus;
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

export enum GameStatus {
    Active,
    Completed,
    Failed
}