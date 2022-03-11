import { Options } from "./options.interface";

export interface Session {
    guesses: string[];
    secret: string;
    previousGames: Game[];
    options: Options;
    challenge: boolean;
}

export interface Game{
    date: string;
    timeSpent: string;
    guesses: string[];
    word: string;
    victory: boolean;
    options: string[];
    challenge: boolean;
}