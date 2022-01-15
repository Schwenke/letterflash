import { TimeSpan } from "./watch.interface";

export interface LeaderBoard {
    leaders: Leader[];
}

export interface Leader{
    name: string;
    time: TimeSpan;
    date: string;
    guesses: string[];
    word: string;
}