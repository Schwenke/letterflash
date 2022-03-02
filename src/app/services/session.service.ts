import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DefaultWordLength, SessionKey } from '../constants';
import { BoardState } from '../models/board-state.interface';
import { Options } from '../models/options.interface';
import { Game, Session } from '../models/session.interface';
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

      let length = session.previousGames.unshift(currentGame);

      if (length > 100) {
        //  arbitrary number of games to track
        session.previousGames.pop();
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
      options: optionsList
    };

    return game;
  }

  private getCurrentGameOptionsList(): string[] {
    let session = this.session.value;
    let options = session.options;

    let optionsList: string[] = [];

    if (options.hardMode) optionsList.push("Hard mode");
    if (options.extremeMode) optionsList.push("Extreme mode");

    return optionsList;
  }

  private getExistingSession(): Session | null {
    let sessionJSON = localStorage.getItem(SessionKey);

    if (sessionJSON) {
      //  backwards compat fix
      sessionJSON = sessionJSON.replace('masochistMode', 'extremeMode');

      return JSON.parse(sessionJSON);
    }

    return null;
  }

  private createSession(): void {
    let session: Session = {
      secret: "",
      guesses: [],
      previousGames: [],
      options: this.getDefaultOptions()
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
}
