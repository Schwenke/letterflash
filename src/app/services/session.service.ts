import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DefaultWordLength, ExtremeModeDescription, HardModeDescription, RecentGameMaximum, SessionKey } from '../constants';
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

  private createGameFromBoardState(boardState: BoardState): Game {
    let session = this.session.value;
    let optionsList: string[] = this.getCurrentGameOptionsList();

    let game: Game = {
      timeSpent: this.timerService.getClockTime(),
      date: new Date().toLocaleDateString("en-US"),
      guesses: session.guesses,
      word: session.secret,
      victory: boardState.success,
      options: optionsList,
      challenge: session.challenge
    };

    return game;
  }

  private updateStatsFromGame(stats: Stats, game: Game): void {
    let length: number = game.word.length;

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
    
    if (game.challenge) ++stats.challenges;
    if (game.challenge && game.victory) ++stats.challengesWon;
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
    this.removeDeprecatedValues(session);

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

  private removeDeprecatedValues(session: Session): void {
    let sessionAny = session as any;

    let keys = Object.keys(sessionAny);

    //  Changed to 'extremeMode'
    if (keys.indexOf('masochistMode') > -1) {
      delete sessionAny.masochistMode;
    }

    //  Changed to 'recentGames' - 03/10/2022
    if (keys.indexOf('previousGames') > -1) {
      delete sessionAny.previousGames;
    }

    //  Changed to 'challenge' - 03/10/2022
    if (keys.indexOf('customGame') > -1) {
      delete sessionAny.customGame;
    }
  }

  private createSession(): void {
    let session: Session = {
      secret: "",
      guesses: [],
      recentGames: [],
      options: this.getDefaultOptions(),
      challenge: false,
      stats: this.getDefaultStats()
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
      challenges: 0,
      challengesWon: 0
    } as Stats;
  }
}
