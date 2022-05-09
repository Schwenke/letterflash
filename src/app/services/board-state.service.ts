import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { DefaultWordLength, MaxGuesses } from '../constants';
import { BoardState, GameStatus, Letter, Word } from '../models/board-state.interface';
import { Session } from '../models/session.interface';
import { DictionaryService } from './dictionary.service';
import { KeyboardService } from './keyboard.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})

export class BoardStateService {
  boardState: BehaviorSubject<BoardState> = new BehaviorSubject<BoardState>({ error: "", gameStatus: GameStatus.Active } as BoardState);
  session: Session;
  wordLength: number = DefaultWordLength;

  constructor(
    private dictionaryService: DictionaryService,
    private keyboardService: KeyboardService,
    private sessionService: SessionService
  ) {

    this.sessionService.session.subscribe(session => {
      if (!session) return;

      this.session = session;
    });
  }

  /** GAME START METHODS */

  public initialize(): void {
    if (this.shouldLoadPreviousSession()) {
      this.loadExistingSession();
    } else {
      this.reset();
    }

    this.startTimer();
  }

  public startNewGame(): void {
    this.reset();
    //  Overwrite the previous session
    this.updateSession();
  }

  public concede(): void {
    //  Fill out the board with fake guesses - needed so existing sessions load correctly
    let emptyGuess: string = "".padEnd(this.wordLength, " ");

    for (let i = this.session.guesses.length; i < 6; i++) {
      this.session.guesses.push(emptyGuess);
    }

    this.endCurrentGame(GameStatus.Failed);
    this.updateSession();
  }

  public startSharedGame(secret: string): void {
    this.wordLength = secret.length;

    this.session.secret = secret;

    this.session.guesses = [];

    //  Session needs to be aware it is a shared game for stat/game tracking
    this.session.shared = true;

    this.resetBoard();

    //  Overwrite the previous session
    this.updateSession();

    this.resetTimer();

    this.startTimer();
  }

  /**
   * Starts the game timer (used for results, stats, history)
   * Auto-updates the session every 30 seconds while game is active
   */
  private startTimer(): void {
    timer(0, 1000).subscribe(ellapsedCycles => {
      //  Game is not the active browser tab
      if (document.hidden) return;
      //  No guesses made so far
      if (this.session.guesses.length === 0) return;

      let boardState: BoardState = this.boardState.value;

      //  Game is over
      if (boardState.gameStatus !== GameStatus.Active) return;

      ++this.session.time;

      this.sessionService.session.next(this.session);

      //  Auto-update the session every 30 seconds
      if (this.session.time % 30 === 0) {
        this.sessionService.save();
      }
    });
  }

  private reset(): void {
    this.wordLength = +this.session.options.wordLength;

    this.session.secret = this.dictionaryService.generateWord(this.wordLength);

    this.session.guesses = [];

    this.session.shared = false;

    this.resetBoard();

    this.resetTimer();
  }

  private resetBoard(): void {
    let boardState = this.getDefaultBoardState();

    this.keyboardService.initialize();

    this.boardState.next(boardState);
  }

  private getDefaultBoardState(): BoardState {
    let boardState: BoardState = {} as BoardState;

    boardState.rowIndex = 0;
    boardState.columnIndex = -1;
    boardState.gameStatus = GameStatus.Active;
    boardState.error = "";
    boardState.words = [];

    for (let i = 0; i < MaxGuesses; i++) {
      let word = {} as Word;
      word.letters = [];

      boardState.words.push(word);

      for (let j = 0; j < this.wordLength; j++) {
        let letter = { value: "", perfect: false, partial: false, committed: false } as Letter;
        boardState.words[i].letters.push(letter);
      }
    }

    return boardState;
  }

  private loadExistingSession(): void {
    let previousGuess: string = "";

    this.wordLength = this.session.guesses[0].length;

    this.resetBoard();

    for (let i = 0; i < this.session.guesses.length; i++) {
      previousGuess = this.session.guesses[i];

      this.updateBoardState(previousGuess);
    }

    let gameStatus = this.getGameStatus();

    if (gameStatus !== GameStatus.Active) {
      this.endCurrentGame(gameStatus);
    }
  }

  private shouldLoadPreviousSession(): boolean {
    return this.session.guesses && this.session.guesses.length > 0;
  }

  /** GAME END METHODS **/

  private getGameStatus(): GameStatus {
    if (this.secretGuessed()) {
      return GameStatus.Completed;
    }

    if (this.exceededMaxGuesses()) {
      return GameStatus.Failed;
    }

    return GameStatus.Active;
  }

  private secretGuessed(): boolean {
    let length: number = this.session.guesses.length - 1;

    for (let i = length; i >= 0; i--) {
      let previousGuess: string = this.session.guesses[i];

      if (previousGuess === this.session.secret) {
        return true;
      }
    }

    return false;
  }

  private exceededMaxGuesses(): boolean {
    let boardState: BoardState = this.boardState.value;

    return boardState.rowIndex >= MaxGuesses;
  }

  private endCurrentGame(gameStatus: GameStatus): void {
    let boardState: BoardState = this.boardState.value;

    boardState.gameStatus = gameStatus;

    this.boardState.next(boardState);
  }

  /** USER INPUT METHODS */

  public removeInput(): void {
    let boardState: BoardState = this.boardState.value;

    //  First column, can't remove further
    if (boardState.columnIndex === -1) return;

    let word = this.getCurrentWord(boardState);

    word.letters[boardState.columnIndex].value = "";

    --boardState.columnIndex;

    //  check to clear any errors, since we will be pushing the observable
    boardState.error = "";

    this.boardState.next(boardState);
  }

  public appendInput(key: string): void {
    let boardState: BoardState = this.boardState.value;

    let maxColumnIndex = this.wordLength - 1;

    //  Last column, can't append any more
    if (boardState.columnIndex === maxColumnIndex) return;

    //  Only let users enter alphabetical characters a-Z
    let validInput: boolean = /^[a-zA-Z]$/.test(key);

    if (validInput) {
      ++boardState.columnIndex;

      let word = this.getCurrentWord(boardState);

      word.letters[boardState.columnIndex].value = key.toLocaleUpperCase();

      //  check to clear any errors, since we will be pushing the observable
      boardState.error = "";

      this.boardState.next(boardState);
    }
  }

  private getCurrentWord(boardState: BoardState): Word {
    return boardState.words[boardState.rowIndex];
  }

  getUserGuess(): string {
    let boardState: BoardState = this.boardState.value;
    let userGuess: string = "";
    let letters = boardState.words[boardState.rowIndex].letters;

    for (let i = 0; i < letters.length; i++) {
      let letter = letters[i];

      userGuess += letter.value;
    }

    return userGuess;
  }

  public guess(): void {
    let timeOut: number = 100;

    //  Give enough time for the pending animation to finish before attempting to commit, which can trigger another animation
    //  If the animations collide, then the flip never plays or other strange behaviors happen
    window.setTimeout(() => {
      this.processGuess();
    }, timeOut);
  }

  private processGuess(): void {
    let boardState: BoardState = this.boardState.value;

    let guess = this.getUserGuess().toLocaleUpperCase();

    boardState.error = this.validate(guess);

    this.boardState.next(boardState);

    //  User entered an invalid guess - don't process further
    if (boardState.error.length > 0) {
      return;
    }

    this.updateBoardState(guess);

    this.session.guesses.push(guess);

    this.updateSession();

    let gameStatus: GameStatus = this.getGameStatus();

    if (gameStatus !== GameStatus.Active) {
      this.endCurrentGame(gameStatus);
      this.updateSession();
    }
  }

  private updateBoardState(guess: string): void {
    let boardState: BoardState = this.boardState.value;
    let secret: string = this.session.secret;

    let secretWordLetters = secret.split('');
    let partialClues: string[] = [];
    let perfectClues: string[] = [];

    //  First look for perfect matches - correct letter in the correct position
    for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess[i].trim();
      let correctLetter = secret[i];
      let boardStateLetter = boardState.words[boardState.rowIndex].letters[i];
      const index = secretWordLetters.indexOf(guessLetter);

      boardStateLetter.committed = guessLetter.length > 0;
      boardStateLetter.value = guessLetter;

      if (guessLetter === correctLetter) {
        boardStateLetter.perfect = true;
        perfectClues.push(guessLetter);
        secretWordLetters.splice(index, 1);
      }
    }

    //  Next, look for partial matches - correct letter in the incorrect position
    //  The loops are done separately so we do not accidentally mark a word with multiples of the same correct clue twice - E.g. Secret word "HUMAN" and guess "AVIAN"
    //  Specifically ignore letters marked as perfect so we do not overwrite perfect status - can happen when secret is FEDERAL and guess is FELLOWS
    for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess[i];
      let boardStateLetter = boardState.words[boardState.rowIndex].letters[i];
      const index = secretWordLetters.indexOf(guessLetter);

      if (!boardStateLetter.perfect && index > -1) {
        partialClues.push(guessLetter);
        boardStateLetter.partial = true;
        secretWordLetters.splice(index, 1);
      }
    }

    this.keyboardService.registerKeys(guess, partialClues, perfectClues);

    //  Move to the next row
    ++boardState.rowIndex;

    //  Reset column index
    boardState.columnIndex = -1;

    this.boardState.next(boardState);
  }

  private validate(guess: string): string {
    //  Exit early if they won
    if (guess === this.session.secret) return "";

    let validGuessLength = this.validateGuessLength(guess);

    if (!validGuessLength) {
      return `Not enough letters`;
    }

    if (this.guessedPreviously(guess)) {
      return "Already guessed";
    }

    let errorMessage = this.validateHardMode(guess);

    if (errorMessage.length > 0) {
      return errorMessage;
    }

    if (!this.dictionaryService.hasWord(guess)) {
      return "Not in dictionary";
    }

    return "";
  }

  private validateGuessLength(guess: string): boolean {

    if (!guess) return false;
    if (guess.trim() === "") return false;
    if (guess.length !== this.wordLength) return false;

    return true;
  }

  private validateHardMode(guess: string): string {
    //  not enabled
    if (!this.session.options.hardMode) return "";

    let boardState: BoardState = this.boardState.value;

    //  No previous guesses
    if (boardState.rowIndex === 0) return "";

    let previousWord = boardState.words[boardState.rowIndex - 1];
    let partialClues = [];

    for (let i = 0; i < previousWord.letters.length; i++) {
      let letter = previousWord.letters[i];

      if (letter.perfect) {
        let guessLetter = guess[i];

        if (guessLetter !== letter.value) {
          let ordinalPosition = this.translateIndex(i);
          return `${ordinalPosition} letter must be ${letter.value}`;
        }
      }

      if (letter.partial) {
        partialClues.push(letter.value);
      }
    }

    for (let i = 0; i < guess.length; i++) {
      let letter = guess[i];
      let clueIndex = partialClues.indexOf(letter);

      if (clueIndex > -1) {
        partialClues.splice(clueIndex, 1);
      }
    }

    if (partialClues.length === 1) {
      return `Letter ${partialClues[0]} missing from guess`;
    }

    if (partialClues.length > 1) {
      return `Letters ${partialClues.join(", ")} missing from guess`;
    }

    return "";
  }

  /**
   * Translates the given index into an ordinal
   * @param index 
   * @returns 
   */
  private translateIndex(index: number): string {
    switch (index) {
      case 1:
        return "Second";
      case 2:
        return "Third";
      case 3:
        return "Fourth";
      case 4:
        return "Fifth";
      case 5:
        return "Sixth";
      case 6:
        return "Seventh";
      default:
        return "First";
    }
  }

  private guessedPreviously(guess: string): boolean {
    let previousGuesses: string[] = this.session.guesses;

    return previousGuesses.includes(guess);
  }

  /** MISC */

  private updateSession(): void {
    let boardState: BoardState = this.boardState.value;

    this.sessionService.update(boardState);
    this.sessionService.save();
  }

  private resetTimer(): void {
    this.session.time = 0;
  }
}
