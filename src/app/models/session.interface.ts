import { Options } from "./options.interface";

export interface Session {
    options: Options;
    stats: Stats;
    recentGames: Game[];
    guesses: string[];
    secret: string;
    challenge: boolean;
    lastVisited: string;
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

export interface Stats {
    trackingDate: string;
    played_5: number;
    played_6: number;
    played_7: number;
    wins_5: number;
    wins_6: number;
    wins_7: number;
    wins_hard: number;
    wins_extreme: number;
    guesses: number;
    time: number;
    challenges: number;
    challengesWon: number;
}