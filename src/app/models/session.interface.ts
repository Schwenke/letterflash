import { Options } from "./options.interface";

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
    options: string[];
}