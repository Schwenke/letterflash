import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardState, Letter, Word } from '../models/board-state.interface';
import { Options } from '../models/options.interface';
import { DictionaryService } from './dictionary.service';
import { KeyboardService } from './keyboard.service';
import { OptionsService } from './options.service';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class BoardStateService {
    boardState: BehaviorSubject<BoardState> = new BehaviorSubject<BoardState>({} as BoardState);
    options: Options = {} as Options;
    maxGuesses: number = 6;
    previousGuesses: string[] = [];

  constructor(
    private dictionaryService: DictionaryService,
    private timerService: TimerService,
    private keyboardService: KeyboardService,
    private optionsService: OptionsService
  ) { 

    this.optionsService.options.subscribe(options => {
      if (!options) return;
      
      this.options = options;
    });
  }

  private initialize(): void {
    let boardState = this.boardState.value;

    let wordLength = this.getWordLength();

    boardState.rowIndex = 0;
    boardState.columnIndex = -1;
    boardState.success = false;
    boardState.failure = false;
    boardState.error = "";
    boardState.secretWord = this.dictionaryService.generateWord(wordLength);

    this.generateDefaultBoardState();
    this.previousGuesses = [];

    this.boardState.next(boardState);
  }

  public reset(): void {
    this.timerService.reset();
    this.initialize();
    this.keyboardService.reset();
    this.timerService.start();
  }

  private updateBoardState(guess: string): void {
    let boardState: BoardState = this.boardState.value;

    let secretWordLetters = boardState.secretWord.split('');
    let correctlyGuessedLetters: string[] = [];

    //  First look for perfect matches - correct letter in the correct position
    for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess[i];
      let correctLetter = boardState.secretWord[i];
      let boardStateLetter = boardState.words[boardState.rowIndex].letters[i];
      const index = secretWordLetters.indexOf(guessLetter);

      boardStateLetter.committed = true;

      if (guessLetter === correctLetter) {
        boardStateLetter.perfect = true;
        correctlyGuessedLetters.push(guessLetter);
        secretWordLetters.splice(index, 1);
      }
    }

    //  Next, look for partial matches - correct letter in the incorrect position
    //  The loops are done separately so we do not accidentally mark a word with multiples of the same correct clue twice - E.g. Secret word "HUMAN" and guess "AVIAN"
    for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess[i];
      let boardStateLetter = boardState.words[boardState.rowIndex].letters[i];
      const index = secretWordLetters.indexOf(guessLetter);

      if (index > -1) {
        correctlyGuessedLetters.push(guessLetter);
        boardStateLetter.partial = true;
        secretWordLetters.splice(index, 1);
      }
    }

    this.keyboardService.registerKeys(guess, correctlyGuessedLetters);

    this.boardState.next(boardState);
  }

  public removeInput(): void {
    let boardState: BoardState = this.boardState.value;

    //  Cannot remove input - already at the first column
    if (boardState.columnIndex === -1) return;
    
    let word = this.getCurrentWord();

    word.letters[boardState.columnIndex].letter = "";

    --boardState.columnIndex;

    this.boardState.next(boardState);
  }

  public appendInput(key: string): void {
    let boardState: BoardState = this.boardState.value;

    let wordLength = this.getWordLength() -1;

    //  Can't append any more characters - word is at max length
    if (boardState.columnIndex === wordLength) return;

    let validInput: boolean = this.keyboardService.validateInput(key);

    if (validInput) {
      ++boardState.columnIndex;

      let word = this.getCurrentWord();

      word.letters[boardState.columnIndex].letter = key.toLocaleUpperCase();

      this.boardState.next(boardState);
    }
  }

  private generateDefaultBoardState(): void {
    let boardState: BoardState = this.boardState.value;

    let wordLength = this.getWordLength();

    boardState.words = [];

    for (let i = 0; i < this.maxGuesses; i++) {
      let word = {} as Word;
      word.letters = [];

      boardState.words.push(word);

      for (let j = 0; j < wordLength; j++) {
        let letter = { letter: "", perfect: false, partial: false, committed: false } as Letter;
        boardState.words[i].letters.push(letter);
      }
    }

    this.boardState.next(boardState);
  }

  public getCurrentWord(): Word {
    let boardState: BoardState = this.boardState.value;

    return boardState.words[boardState.rowIndex];
  }

  public getWordLength(): number {
    return +this.options.wordLength;
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
    let boardState: BoardState = this.boardState.value;

    let word = this.getUserGuess().toLocaleUpperCase();

    boardState.error = this.validate(word);;

    this.boardState.next(boardState);

    if (boardState.error.length > 0) {
      //  User input error - don't process further
      return;
    }

    this.processGuess(word);

    if (this.checkVictory(word)) return;
    if (this.checkFailure()) return;

    this.previousGuesses.push(word);
  }

  private processGuess(guess: string): void {
    let boardState: BoardState = this.boardState.value;

    this.updateBoardState(guess);
    //  Move to the next row
    ++boardState.rowIndex;
    //  Reset column index
    boardState.columnIndex = -1;

    this.boardState.next(boardState);
  }

  private checkFailure(): boolean {
    let boardState: BoardState = this.boardState.value;

    if (!boardState.success && boardState.rowIndex >= this.maxGuesses) {
      boardState.failure = true;
      this.timerService.stop();
      // todo
      // this.openFailureDialog();
      this.boardState.next(boardState);
      return true;
    }

    return false;
  }

  private checkVictory(guess: string): boolean {
    let boardState: BoardState = this.boardState.value;

    if (guess === boardState.secretWord) {
      boardState.success = true;
      this.timerService.stop();
      this.boardState.next(boardState);
      // todo
      // this.openVictoryDialog();
      return true;
    }

    return false;
  }

  private validate(guess: string): string {
    if (!guess || guess.trim() === "") {
      return "You cannot enter empty words!";
    }

    let wordLength = this.getWordLength();

    if (guess.length !== wordLength) {
      return `Words must be ${wordLength} letters long!`;
    }

    if (!this.dictionaryService.hasWord(guess)) {
      return "This isn't a real word!";
    }

    if (this.guessedPreviously(guess)) {
      return "You've already guessed this before!";
    }

    if (!this.validateHardMode(guess)) {
      return "Hard mode is enabled - you must use all previous correctly guessed letters in subsequent guesses!";
    }

    return "";
  }

  private validateHardMode(guess: string): boolean {
    //  not enabled
    if (!this.options.hardMode) return true;

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
    for (let i = 0; i < this.previousGuesses.length; i++) {
      let previousGuess = this.previousGuesses[i];

      if (guess === previousGuess) {
        return true
      }
    }

    return false;
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


}
