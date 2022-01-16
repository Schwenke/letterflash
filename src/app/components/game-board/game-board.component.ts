import { Component, OnInit } from '@angular/core';
import { BoardState, Letter, Word } from 'src/app/models/board-state.interface';
import { DictionaryService } from '../../services/dictionary.service';
import { TimerService } from 'src/app/services/timer.service';
import { TimeSpan } from 'src/app/models/watch.interface';
import { KeyBoard, KeyBoardRow } from 'src/app/models/keyboard.interface';
import { MatDialog } from '@angular/material/dialog';
import { VictoryDialogComponent } from '../victory-dialog/victory-dialog.component';
import { DialogData } from 'src/app/models/dialog-data.interface';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})

export class GameBoardComponent implements OnInit {
  initialized: boolean = false;
  wordLength: string = "5";
  maxGuesses: number = 6;
  userInput = "";
  message: string = "";
  previousGuesses: string[] = [];
  success: boolean = false;
  failure: boolean = false;
  hardMode: boolean = false;
  userName: string = "";

  //  game state
  boardState: BoardState = {} as BoardState;
  secretWord: string = "";
  guessIndex: number = 0;

  //  timer
  timeSpan: TimeSpan = {} as TimeSpan;

  // keyboard
  keyBoard: KeyBoard = {} as KeyBoard;

  constructor(
    private dictionaryService: DictionaryService,
    private timerService: TimerService,
    public dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.dictionaryService.dictionary.subscribe(dictionary => {
      if (dictionary.length === 0) return;

      this.initialize();

      this.timerService.timeSpan.subscribe(time => {
        this.timeSpan = time;
      });
    });
  }

  private initialize(): void {
    let wordLength = this.getWordLength();
    this.initializeKeyBoard();
    let randomWord = this.dictionaryService.generateWord(wordLength);
    this.secretWord = randomWord;
    this.generateDefaultBoardState();
    this.userInput = "";
    this.message = "";
    this.previousGuesses = [];
    this.success = false;
    this.failure = false;
    this.guessIndex = 0;
    this.timerService.start();
    this.initialized = true;
  }

  private initializeKeyBoard(): void {
    this.keyBoard.rows = [];

    for (let i = 0; i < 3; i++) {
      let row: KeyBoardRow = {} as KeyBoardRow;
      row.index = i;

      this.keyBoard.rows.push(row);
    }

    this.keyBoard.rows[0].keys = [
      { letter: "Q", guessed: false, correct: false },
      { letter: "W", guessed: false, correct: false },
      { letter: "E", guessed: false, correct: false },
      { letter: "R", guessed: false, correct: false },
      { letter: "T", guessed: false, correct: false },
      { letter: "Y", guessed: false, correct: false },
      { letter: "U", guessed: false, correct: false },
      { letter: "I", guessed: false, correct: false },
      { letter: "O", guessed: false, correct: false },
      { letter: "P", guessed: false, correct: false }
    ];

    this.keyBoard.rows[1].keys = [
      { letter: "A", guessed: false, correct: false },
      { letter: "S", guessed: false, correct: false },
      { letter: "D", guessed: false, correct: false },
      { letter: "F", guessed: false, correct: false },
      { letter: "G", guessed: false, correct: false },
      { letter: "H", guessed: false, correct: false },
      { letter: "J", guessed: false, correct: false },
      { letter: "K", guessed: false, correct: false },
      { letter: "L", guessed: false, correct: false },
      { letter: " ", guessed: false, correct: false }
    ];

    this.keyBoard.rows[2].keys = [
      { letter: " ", guessed: false, correct: false },
      { letter: "Z", guessed: false, correct: false },
      { letter: "X", guessed: false, correct: false },
      { letter: "C", guessed: false, correct: false },
      { letter: "V", guessed: false, correct: false },
      { letter: "B", guessed: false, correct: false },
      { letter: "N", guessed: false, correct: false },
      { letter: "M", guessed: false, correct: false },
      { letter: " ", guessed: false, correct: false },
      { letter: " ", guessed: false, correct: false }
    ];
  }

  private getWordLength(): number {
    return +this.wordLength;
  }

  public formatClock(timeSpan: TimeSpan): string {
    return this.timerService.formatClock(timeSpan);
  }

  public reset(): void {
    this.timerService.reset();
    this.initialize();
  }

  private generateDefaultBoardState(): void {
    let wordLength = this.getWordLength();

    this.boardState.words = [];

    for (let i = 0; i < this.maxGuesses; i++) {
      let word = {} as Word;
      word.letters = [];

      this.boardState.words.push(word);

      for (let j = 0; j < wordLength; j++) {
        let letter = { letter: "", perfect: false, partial: false, committed: false } as Letter;
        this.boardState.words[i].letters.push(letter);
      }
    }
  }

  guess(): void {
    let guess = this.userInput.toLocaleUpperCase();

    this.message = this.validate(guess);

    if (this.message.length > 0) {
      //  User input error - don't process further
      return;
    }

    this.processGuess(guess);

    if (this.checkVictory(guess)) return;
    if (this.checkFailure()) return;

    this.previousGuesses.push(guess);
  }

  private processGuess(guess: string): void {
    this.updateBoardState(guess);
    ++this.guessIndex;
  }

  private checkFailure(): boolean {
    if (!this.success && this.guessIndex >= this.maxGuesses) {
      this.failure = true;
      this.timerService.stop();
      this.message = `Too bad! You failed to guess the secret word: ${this.secretWord}`;
      return true;
    }

    return false;
  }

  private checkVictory(guess: string): boolean {
    if (guess === this.secretWord) {
      this.success = true;
      this.timerService.stop();
      this.openDialog();
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
      return "Words must be five letters long!";
    }

    if (!this.dictionaryContainsWord(guess)) {
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
    if (!this.hardMode) return true;

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

  private dictionaryContainsWord(word: string): boolean {
    return this.dictionaryService.hasWord(word);
  }

  private getCorrectlyGuessedLetters(): string[] {
    let correctGuesses: string[] = [];

    for (let i = 0; i < this.keyBoard.rows.length; i++) {
      let row = this.keyBoard.rows[i];

      for (let k = 0; k < row.keys.length; k++) {
        let key = row.keys[k];

        if (key.correct) {
          correctGuesses.push(key.letter);
        }
      }
    }

    return correctGuesses;
  }

  private updateBoardState(guess: string): void {
    //  Clear the input field
    this.userInput = "";

    let secretWordLetters = this.secretWord.split('');
    let correctlyGuessedLetters: string[] = [];

    // Validate correct letter && position first
    for (let i = 0; i < this.secretWord.length; i++) {
      let answerLetter = this.secretWord[i];
      let guessLetter = guess[i];

      // see if the letter is in the word and correct position
      if (guessLetter === answerLetter) {
        correctlyGuessedLetters.push(guessLetter);
        this.boardState.words[this.guessIndex].letters[i].perfect = true;
        let index = secretWordLetters.indexOf(guessLetter);
        secretWordLetters.splice(index, 1);
      }
    }

    //  Validate correct letter, incorrect position
    for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess[i];
      let boardStateLetter = this.boardState.words[this.guessIndex].letters[i];

      //  All letters have been validated, so committ them
      boardStateLetter.committed = true;

      if (boardStateLetter.perfect) {
        //  Can't be partial if its already perfect
        continue;
      }

      const index = secretWordLetters.indexOf(guessLetter);

      if (index > -1) {
        correctlyGuessedLetters.push(guessLetter);
        this.boardState.words[this.guessIndex].letters[i].partial = true;
        secretWordLetters.splice(index, 1);
      }
    }

    this.registerKeys(guess, correctlyGuessedLetters);
  }

  private registerKeys(guess: string, correctLetters: string[]): void {
    for (let i = 0; i < guess.length; i++) {
      let letter = guess[i];
      let correct = correctLetters.indexOf(letter) > -1;

      this.registerKey(letter, correct);
    }
  }

  private registerKey(letter: string, correct: boolean) {
    for (let i = 0; i < this.keyBoard.rows.length; i++) {
      let row = this.keyBoard.rows[i];

      let keyBoardKey = row.keys.find(key => key.letter === letter);

      if (keyBoardKey && !keyBoardKey.guessed) {
        keyBoardKey.guessed = true;
        keyBoardKey.correct = correct;
      }
    }
  }

  handleUserInput() {
    let userInput = this.userInput;
    let wordLength = this.getWordLength();

    for (let i = 0; i < wordLength; i++) {
      let letter = userInput[i];

      if (letter) {
        this.boardState.words[this.guessIndex].letters[i].letter = userInput[i];
      } else {
        this.boardState.words[this.guessIndex].letters[i].letter = "";
      }
    }
  }

  handleUserInput2(event: KeyboardEvent) {
    let userInput = this.userInput;
    let wordLength = this.getWordLength();

    for (let i = 0; i < wordLength; i++) {
      let letter = userInput[i];

      if (letter) {
        this.boardState.words[this.guessIndex].letters[i].letter = userInput[i];
      } else {
        this.boardState.words[this.guessIndex].letters[i].letter = "";
      }
    }
  }
  
  openDialog(): void {
    let dialogData: DialogData = {
      guessIndex: this.guessIndex,
      maxGuesses: this.maxGuesses,
      boardState: this.boardState,
      secretWord: this.secretWord,
      timeSpan: this.timeSpan
    };

    const dialogRef = this.dialog.open(VictoryDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      //  todo?
    });
  }
}
