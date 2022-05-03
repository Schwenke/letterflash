import { Options } from "./options.interface";

export interface Session {
    options: Options;
    stats: Stats;
    recentGames: Game[];
    guesses: string[];
    secret: string;
    shared: boolean;
    lastVisited: string;
    time: number;
}

export interface Game{
    date: string;
    time: number;
    guesses: string[];
    secret: string;
    victory: boolean;
    hard: boolean;
    extreme: boolean;
    shared: boolean;
}

export interface Stats {
    trackingDate: string;
    guesses: number;
    played_5: number;
    played_6: number;
    played_7: number;
    played_hard: number;
    played_extreme: number;
    played_shared: number;
    wins_5: number;
    wins_6: number;
    wins_7: number;
    wins_hard: number;
    wins_extreme: number;
    wins_shared: number;
    time_5: number;
    time_6: number;
    time_7: number;
    winStreak: number;
    winStreak_hard: number;
    winStreak_extreme: number;
    winStreak_shared: number;
    maxWinStreak: number;
    maxWinStreak_hard: number;
    maxWinStreak_extreme: number;
    maxWinStreak_shared: number;
}