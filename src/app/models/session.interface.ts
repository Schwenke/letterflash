import { Options } from "./options.interface";
import { TimeSpan } from "./watch.interface";

export interface Session {
    previousGames: Game[];
    options: Options;
}

export interface Game{
    date: string;
    timeSpent: string;
    guesses: string[];
    word: string;
    victory: boolean;
}