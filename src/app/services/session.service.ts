import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseURL, DefaultWordLength, ExtremeModeDescription, HardModeDescription, RecentGameMaximum, SessionKey, ShareParameter } from '../constants';
import { BoardState } from '../models/board-state.interface';
import { Options } from '../models/options.interface';
import { Game, Session, Stats } from '../models/session.interface';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  session: BehaviorSubject<Session>;

  constructor(
    private timerService: TimerService
  ) { 
    let existingSession = this.getExistingSession();

    if (!existingSession) {
      this.createSession();
    } else {
      this.session = new BehaviorSubject<Session>(existingSession);
    }
  }

  // Saves the current session into local storage
  save(): void {
    let session = this.session.value;

    let jsonValue = JSON.stringify(session);

    localStorage.setItem(SessionKey, jsonValue);
  }

  //  Gets the current observable value and pushes it back, triggering an update in components that listen
  refresh(): void {
    let session = this.session.value;

    this.session.next(session);
  }

  //  Updates the current session with data from the board state
  update(boardState: BoardState): void {
    let session = this.session.value;

    session.lastVisited = new Date().toLocaleString();

    if (boardState.failure || boardState.success) {
      let currentGame = this.createGameFromBoardState(boardState);

      this.updateStatsFromGame(session, currentGame);

      let previousGameCount = session.recentGames.unshift(currentGame);

      if (previousGameCount > RecentGameMaximum) {
        session.recentGames.pop();
      }
    }

    this.session.next(session);
  }

  getShareLink(secret: string): string {
    let encodedSecret: string = btoa(secret);
    let shareLink: string = `${BaseURL}?${ShareParameter}=${encodedSecret}`;

    return shareLink;
  }

  private createGameFromBoardState(boardState: BoardState): Game {
    let session = this.session.value;

    let game: Game = {
      time: this.timerService.getSeconds(),
      date: new Date().toLocaleDateString("en-US"),
      guesses: session.guesses,
      secret: session.secret,
      victory: boardState.success,
      hard: session.options.hardMode,
      extreme: session.options.extremeMode,
      shared: session.shared
    };

    return game;
  }

  private updateStatsFromGame(session: Session, game: Game): void {
    let stats = session.stats;
    let length: number = game.secret.length;

    switch (length) {
      case 7:
        ++stats.played_7;
        stats.time_7 += game.time;
        if (game.victory) ++stats.wins_7;
        break;
      case 6:
        ++stats.played_6;
        stats.time_6 += game.time;
        if (game.victory) ++stats.wins_6;
        break;
      default:
        ++stats.played_5;
        stats.time_5 += game.time;
        if (game.victory) ++stats.wins_5;
        break;
    }

    if (game.victory) {
      ++stats.winStreak;
      if (stats.winStreak > stats.maxWinStreak) stats.maxWinStreak = stats.winStreak;
    } else {
      stats.winStreak = 0;
    }

    if (game.hard) {
      ++stats.played_hard;
      if (game.victory) {
        ++stats.wins_hard;
        ++stats.winStreak_hard;
        if (stats.winStreak_hard > stats.maxWinStreak_hard) stats.maxWinStreak_hard = stats.winStreak_hard;
      } else {
        stats.winStreak_hard = 0;
      }
    }

    if (game.extreme) {
      ++stats.played_extreme;
      if (game.victory) {
        ++stats.wins_extreme;
        ++stats.winStreak_extreme;
        if (stats.winStreak_extreme > stats.maxWinStreak_extreme) stats.maxWinStreak_extreme = stats.winStreak_extreme;
      } else {
        stats.winStreak_extreme = 0;
      }
    }

    if (game.shared) {
      ++stats.played_shared;
      if (game.victory) {
        ++stats.wins_shared;
        ++stats.winStreak_shared;
        if (stats.winStreak_shared > stats.maxWinStreak_shared) stats.maxWinStreak_shared = stats.winStreak_shared;
      } else {
        stats.winStreak_shared = 0;
      }
    }

    stats.guesses += game.guesses.length;
  }

  private getExistingSession(): Session | null {
    let sessionJSON = localStorage.getItem(SessionKey);

    if (sessionJSON) {
      let session: Session = JSON.parse(sessionJSON);

      return session;
    }

    return null;
  }

  private createSession(): void {
    let session: Session = {
      secret: "",
      guesses: [],
      recentGames: [],
      options: this.getDefaultOptions(),
      shared: false,
      stats: this.getDefaultStats(),
      lastVisited: new Date().toLocaleString()
    };

    this.session = new BehaviorSubject<Session>(session);
  }

  private getDefaultOptions(): Options {
    let defaultWordLength: string = `${DefaultWordLength}`;

    return {
      hardMode: false,
      extremeMode: false,
      darkMode: false,
      wordLength: defaultWordLength
    };
  }

  private getDefaultStats(): Stats {
    return {
      trackingDate: new Date().toLocaleDateString("en-US"),
      guesses: 0,
      played_5: 0,
      played_6: 0,
      played_7: 0,
      played_hard: 0,
      played_extreme: 0,
      played_shared: 0,
      wins_5: 0,
      wins_6: 0,
      wins_7: 0,
      wins_hard: 0,
      wins_extreme: 0,
      wins_shared: 0,
      time_5: 0,
      time_6: 0,
      time_7: 0,
      winStreak: 0,
      winStreak_hard: 0,
      winStreak_extreme: 0,
      winStreak_shared: 0,
      maxWinStreak: 0,
      maxWinStreak_hard: 0,
      maxWinStreak_extreme: 0,
      maxWinStreak_shared: 0
    } as Stats;
  }
}
