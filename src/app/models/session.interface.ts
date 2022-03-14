import { Options } from "./options.interface";

export interface Session {
    options: Options;
    stats: Stats;
    recentGames: Game[];
    guesses: string[];
    //  Current game secret word
    secret: string;
    //  Whether or not the current game was from a share link
    shared: boolean;
    lastVisited: string;
}

export interface Game{
    date: string;
    timeSpent: string;
    guesses: string[];
    secret: string;
    victory: boolean;
    options: string[];
    //  Was the game from a shared puzzle link
    shared: boolean;
}

export interface Stats {
    //  When stat tracking began for this device/browser/session
    trackingDate: string;
    played_5: number;
    played_6: number;
    played_7: number;
    wins_5: number;
    wins_6: number;
    wins_7: number;
    wins_hard: number;
    wins_extreme: number;
    //  Total number of guesses made
    guesses: number;
    //  Total time spent playing in seconds
    time: number;
    shares: number;
    sharesWon: number;
}