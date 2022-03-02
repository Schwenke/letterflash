import { Options } from "./options.interface";

export interface Session {
    guesses: string[];
    secret: string;
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