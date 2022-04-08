import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DefaultWordLength, MaxGuesses } from '../constants';
import { BoardState, GameStatus, Letter, Word } from '../models/board-state.interface';
import { Session } from '../models/session.interface';
import { DictionaryService } from './dictionary.service';
import { KeyboardService } from './keyboard.service';
import { SessionService } from './session.service';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})

export class BoardStateService {
  boardState: BehaviorSubject<BoardState> = new BehaviorSubject<BoardState>({ error: "", gameStatus: GameStatus.Active } as BoardState);
  session: Session;
  wordLength: number = DefaultWordLength;

  constructor(
    private dictionaryService: DictionaryService,
    private timerService: TimerService,
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
  }

  public startNewGame(): void {
    this.reset();
    //  If a user starts a new game, clear out existing session secret and guesses
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

    //  Obliterate old session
    this.updateSession();

    this.resetTimer();
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
        let letter = { letter: "", perfect: false, partial: false, committed: false } as Letter;
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
    } else {
      this.resetTimer();
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

  /**
   * Stops the timer, sets the new game status, and pushes the observable
   * @param boardState 
   */
  private endCurrentGame(gameStatus: GameStatus): void {
    let boardState: BoardState = this.boardState.value;

    boardState.gameStatus = gameStatus;

    this.timerService.stop();

    this.boardState.next(boardState);
  }

  /** USER INPUT METHODS */

  public removeInput(): void {
    let boardState: BoardState = this.boardState.value;

    //  Cannot remove input - already at the first column
    if (boardState.columnIndex === -1) return;

    let word = this.getCurrentWord(boardState);

    word.letters[boardState.columnIndex].letter = "";

    --boardState.columnIndex;

    //  check to clear any errors, since we will be pushing the observable
    boardState.error = "";

    this.boardState.next(boardState);
  }

  public appendInput(key: string): void {
    let boardState: BoardState = this.boardState.value;

    let maxColumnIndex = this.wordLength - 1;

    //  Can't append any more characters - word is at max length
    if (boardState.columnIndex === maxColumnIndex) return;

    //  Only let users enter alphabetical characters a-Z
    let validInput: boolean = /^[a-zA-Z]$/.test(key);

    if (validInput) {
      ++boardState.columnIndex;

      let word = this.getCurrentWord(boardState);

      word.letters[boardState.columnIndex].letter = key.toLocaleUpperCase();

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

      userGuess += letter.letter;
    }

    return userGuess;
  }

  public guess(): void {
    let timeOut: number = 100;

    //  Give enough time for the pending animation to finish before attempting to commit, which can trigger another animation
    //  If the animations collide, then the flip never plays and causes some weirdness to happen with the pending

    window.setTimeout(() => {
      this.processGuess();
    }, timeOut);
  }

  private processGuess(): void {
    let boardState: BoardState = this.boardState.value;

    let guess = this.getUserGuess().toLocaleUpperCase();

    boardState.error = this.validate(guess);

    this.boardState.next(boardState);

    if (boardState.error.length > 0) {
      //  User input error - don't process further
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
      boardStateLetter.letter = guessLetter;

      if (guessLetter === correctLetter) {
        boardStateLetter.perfect = true;
        perfectClues.push(guessLetter);
        secretWordLetters.splice(index, 1);
      }
    }

    //  Next, look for partial matches - correct letter in the incorrect position
    //  The loops are done separately so we do not accidentally mark a word with multiples of the same correct clue twice - E.g. Secret word "HUMAN" and guess "AVIAN"
    //  Specifically ignore letters marked as perfect so we do not overwrite perfect status - can happen e.g. in 7 word mode when secret is FEDERAL and guess is FELLOWS
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
    //  If they won the game, save performance by returning early
    if (guess === this.session.secret) return "";

    if (!guess || guess.trim() === "") {
      return "Please enter a word";
    }

    let wordLength = this.wordLength;

    if (guess.length !== wordLength) {
      return `Word length must be ${wordLength}`;
    }

    if (this.guessedPreviously(guess)) {
      return "Word has already been used";
    }

    if (!this.validateHardMode(guess)) {
      return "Word must use all previous clues";
    }

    if (!this.dictionaryService.hasWord(guess)) {
      return "Word not found in dictionary";
    }

    return "";
  }

  private validateHardMode(guess: string): boolean {
    //  not enabled
    if (!this.session.options.hardMode) return true;

    let correctlyGuessedLetters = this.getCorrectlyGuessedLetters();

    // no correct guesses so far
    if (correctlyGuessedLetters.length === 0) return true;

    for (let i = 0; i < correctlyGuessedLetters.length; i++) {
      let letter = correctlyGuessedLetters[i];
      let index = guess.indexOf(letter);

      if (index === -1) {
        //  the guess doesn't contain the letter
        return false;
      }
    }

    return true;
  }

  private guessedPreviously(guess: string): boolean {
    let previousGuesses: string[] = this.session.guesses;

    return previousGuesses.includes(guess);
  }

  private getCorrectlyGuessedLetters(): string[] {
    let boardState: BoardState = this.boardState.value;

    let correctGuesses: string[] = [];

    for (let i = 0; i < boardState.rowIndex; i++) {
      let row = boardState.words[i];

      for (let k = 0; k < row.letters.length; k++) {
        let letter = row.letters[k];

        if (letter.perfect || letter.partial) {
          correctGuesses.push(letter.letter);
        }
      }
    }

    return correctGuesses;
  }

  /** MISC */

  private updateSession(): void {
    let boardState: BoardState = this.boardState.value;

    this.sessionService.update(boardState);
    this.sessionService.save();
  }

  private resetTimer(): void {
    this.timerService.reset();
    this.timerService.start();
  }


}
