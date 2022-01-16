import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Keyboard, KeyboardRow } from '../models/keyboard.interface';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  // keyboard
  keyboard: BehaviorSubject<Keyboard> = new BehaviorSubject<Keyboard>({} as Keyboard);

  constructor(

  ) { 
    this.initializeKeyBoard();
  }

  public reset(): void {
    this.initializeKeyBoard();
  }

  public registerKeys(guess: string, correctLetters: string[]): void {
    let keyBoard = this.keyboard.value;

    for (let i = 0; i < guess.length; i++) {
      let letter = guess[i];
      let correct = correctLetters.indexOf(letter) > -1;

      this.registerKey(keyBoard, letter, correct);
    }

    this.keyboard.next(keyBoard);
  }

  public validateInput(key: string): boolean {
    return /^[a-zA-Z]$/.test(key);
  }

  private registerKey(keyBoard: Keyboard, letter: string, correct: boolean) {   
    for (let i = 0; i < keyBoard.rows.length; i++) {
      let row = keyBoard.rows[i];

      let keyBoardKey = row.keys.find(key => key.letter === letter);

      if (keyBoardKey && !keyBoardKey.guessed) {
        keyBoardKey.guessed = true;
        keyBoardKey.correct = correct;
      }
    }
  }

  private initializeKeyBoard(): void {
    let keyBoard = this.keyboard.value;

    keyBoard.rows = [];

    for (let i = 0; i < 3; i++) {
      let row: KeyboardRow = {} as KeyboardRow;
      row.index = i;

      keyBoard.rows.push(row);
    }

    keyBoard.rows[0].keys = [
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

    keyBoard.rows[1].keys = [
      { letter: "A", guessed: false, correct: false },
      { letter: "S", guessed: false, correct: false },
      { letter: "D", guessed: false, correct: false },
      { letter: "F", guessed: false, correct: false },
      { letter: "G", guessed: false, correct: false },
      { letter: "H", guessed: false, correct: false },
      { letter: "J", guessed: false, correct: false },
      { letter: "K", guessed: false, correct: false },
      { letter: "L", guessed: false, correct: false },
      { letter: "Ent", guessed: false, correct: false }
    ];

    keyBoard.rows[2].keys = [
      { letter: " ", guessed: false, correct: false },
      { letter: "Z", guessed: false, correct: false },
      { letter: "X", guessed: false, correct: false },
      { letter: "C", guessed: false, correct: false },
      { letter: "V", guessed: false, correct: false },
      { letter: "B", guessed: false, correct: false },
      { letter: "N", guessed: false, correct: false },
      { letter: "M", guessed: false, correct: false },
      { letter: " ", guessed: false, correct: false },
      { letter: "❌", guessed: false, correct: false }
    ];

    this.keyboard.next(keyBoard);
  }
}
