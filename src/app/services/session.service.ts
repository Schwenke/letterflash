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

      this.updateStatsFromGame(session.stats, currentGame);

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
    let optionsList: string[] = this.getCurrentGameOptionsList();

    let game: Game = {
      timeSpent: this.timerService.getClockTime(),
      date: new Date().toLocaleDateString("en-US"),
      guesses: session.guesses,
      secret: session.secret,
      victory: boardState.success,
      options: optionsList,
      shared: session.shared
    };

    return game;
  }

  private updateStatsFromGame(stats: Stats, game: Game): void {
    let length: number = game.secret.length;

    switch (length) {
      case 7:
        ++stats.played_7;
        if (game.victory) ++stats.wins_7;
        break;
      case 6:
        ++stats.played_6;
        if (game.victory) ++stats.wins_6;
        break;
      default:
        ++stats.played_5;
        if (game.victory) ++stats.wins_5;
        break;
    }

    stats.guesses += game.guesses.length;
    
    if (game.shared) ++stats.shares;
    if (game.shared && game.victory) ++stats.sharesWon;
    if (game.options.indexOf(HardModeDescription) > -1) ++stats.wins_hard;
    if (game.options.indexOf(ExtremeModeDescription) > -1) ++stats.wins_extreme;

    let timeSpent: string[] = game.timeSpent.split(":");
    let hours = +timeSpent[0] * 3600;
    let minutes = +timeSpent[1] * 60;
    let seconds = +timeSpent[2];
    let totalTime = (hours + minutes + seconds);

    stats.time += totalTime;
  }

  private getCurrentGameOptionsList(): string[] {
    let session = this.session.value;
    let options = session.options;

    let optionsList: string[] = [];

    if (options.hardMode) optionsList.push(HardModeDescription);
    if (options.extremeMode) optionsList.push(ExtremeModeDescription);

    return optionsList;
  }

  private getExistingSession(): Session | null {
    let sessionJSON = localStorage.getItem(SessionKey);

    if (sessionJSON) {
      let session: Session = JSON.parse(sessionJSON);

      this.triageSession(session);

      return session;
    }

    return null;
  }

  /**
   * Updates existing sessions with default values for any new properties
   * Also removes any deprecated properties
   */
  private triageSession(session: Session): void {
    this.initializeSessionVariables(session);
    this.syncOldPropertiesToNew(session);
    this.removeDeprecatedValues(session);
  }

  private initializeSessionVariables(session: Session): void {
    if (!session.recentGames) {
      session.recentGames = [];
    }

    if (!session.stats) {
      session.stats = this.getDefaultStats();
    }

    if  (!session.stats.trackingDate) {
      session.stats.trackingDate = new Date().toLocaleDateString("en-US");
    }
  }

  private syncOldPropertiesToNew(session: Session): void {
    let statsAny = session.stats as any;
    let statKeys = Object.keys(statsAny);

    //  Changed to 'shares' - 03/13/2022
    if (statKeys.indexOf('challenges') > -1) {
      session.stats.shares = statsAny.challenges;
    }

    //  Changed to 'sharesWon' - 03/13/2022
    if (statKeys.indexOf('challengesWon') > -1) {
      session.stats.sharesWon = statsAny.challengesWon;
    }

    if (session.recentGames && session.recentGames.length > 0) {
      for (let i = 0; i < session.recentGames.length; i++) {
        let game: Game = session.recentGames[i];
        let gameAny = session.recentGames[i] as any;
        let gameKeys = Object.keys(gameAny);

        //  Changed to 'sharesWon' - 03/13/2022
        if (gameKeys.indexOf('word') > -1) {
          game.secret = gameAny.word;
        }

        if (gameKeys.indexOf('challenge') > -1) {
          game.shared = gameAny.challenge;
        }
      }
    }
  }

  private removeDeprecatedValues(session: Session): void {
    let sessionAny = session as any;
    let statsAny = session.stats as any;
    let sessionKeys = Object.keys(sessionAny);
    let statKeys = Object.keys(statsAny);

    //  Changed to 'recentGames' - 03/10/2022
    if (sessionKeys.indexOf('previousGames') > -1) {
      delete sessionAny.previousGames;
    }

    //  Changed to 'challenge' - 03/10/2022
    if (sessionKeys.indexOf('customGame') > -1) {
      delete sessionAny.customGame;
    }

    //  Changed to 'shared' - 03/13/2022
    if (sessionKeys.indexOf('challenge') > -1) {
      delete sessionAny.challenge;
    }

    //  Changed to 'shares' - 03/13/2022
    if (statKeys.indexOf('challenges') > -1) {
      delete statsAny.challenges;
    }

    //  Changed to 'sharesWon' - 03/13/2022
    if (statKeys.indexOf('challengesWon') > -1) {
      delete statsAny.challengesWon;
    }

    if (session.recentGames && session.recentGames.length > 0) {
      for (let i = 0; i < session.recentGames.length; i++) {
        let gameAny = session.recentGames[i] as any;
        let gameKeys = Object.keys(gameAny);

        //  Changed to 'secret' - 03/13/2022
        if (gameKeys.indexOf('word') > -1) {
          delete gameAny.word;
        }

        //  Changed to 'shared' - 03/13/2022
        if (gameKeys.indexOf('challenge') > -1) {
          delete gameAny.challenge;
        }
      }
    }

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
      played_5: 0,
      played_6: 0,
      played_7: 0,
      wins_5: 0,
      wins_6: 0,
      wins_7: 0,
      wins_hard: 0,
      wins_extreme: 0,
      guesses: 0,
      time: 0,
      shares: 0,
      sharesWon: 0
    } as Stats;
  }
}
