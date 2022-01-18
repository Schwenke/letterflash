import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardState } from '../models/board-state.interface';
import { Options } from '../models/options.interface';
import { Game, Session } from '../models/session.interface';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  session: BehaviorSubject<Session>;

  private storageKey = "uwg-session";

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
  saveSession(): void {
    let session = this.session.value;

    let jsonValue = JSON.stringify(session);

    localStorage.setItem(this.storageKey, jsonValue);
  }

  //  Updates the current session with data from the board state
  updateSession(boardState: BoardState): void {
    let currentGame = this.createGameFromBoardState(boardState);

    let session = this.session.value;

    let length = session.previousGames.unshift(currentGame);

    if (length > 100) {
      //  arbitrary number of games to track
      session.previousGames.pop();
    }

    this.session.next(session);
  }

  private createGameFromBoardState(boardState: BoardState): Game {
    let optionsList: string[] = this.getCurrentGameOptionsList();

    let game: Game = {
      timeSpent: this.timerService.getClockTime(),
      date: new Date().toLocaleDateString("en-US"),
      guesses: boardState.previousGuesses,
      word: boardState.secretWord,
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
    if (options.masochistMode) optionsList.push("Masochist mode");

    return optionsList;
  }

  private getExistingSession(): Session | null {
    let sessionJSON = localStorage.getItem(this.storageKey);

    if (sessionJSON) {
      return JSON.parse(sessionJSON);
    }

    return null;
  }

  private createSession(): void {
    let session: Session = {
      options: this.getDefaultOptions(),
      previousGames: []
    };

    this.session = new BehaviorSubject<Session>(session);
  }

  private getDefaultOptions(): Options {
    return {
      hardMode: false,
      masochistMode: false,
      wordLength: "5"
    };
  }
}
