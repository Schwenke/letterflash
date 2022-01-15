import { BoardState } from "./board-state.interface";
import { TimeSpan } from "./watch.interface";

export interface DialogData {
    //  game state
    boardState: BoardState;
    guessIndex: number;
    secretWord: string;
    maxGuesses: number;
    timeSpan: TimeSpan;
  }