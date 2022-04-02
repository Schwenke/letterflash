import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BACKSPACE, ENTER } from '../constants';
import { Key, Keyboard, KeyboardRow } from '../models/keyboard.interface';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  keyboard: BehaviorSubject<Keyboard> = new BehaviorSubject<Keyboard>({} as Keyboard);

  constructor() { 
    this.initialize();
  }

  public initialize(): void {
    let keyBoard = this.keyboard.value;

    keyBoard.rows = [];

    for (let i = 0; i < 3; i++) {
      let row: KeyboardRow = {} as KeyboardRow;
      row.index = i;

      keyBoard.rows.push(row);
    }

    keyBoard.rows[0].keys = [
      { letter: "Q", guessed: false, partial: false, perfect: false },
      { letter: "W", guessed: false, partial: false, perfect: false },
      { letter: "E", guessed: false, partial: false, perfect: false },
      { letter: "R", guessed: false, partial: false, perfect: false },
      { letter: "T", guessed: false, partial: false, perfect: false },
      { letter: "Y", guessed: false, partial: false, perfect: false },
      { letter: "U", guessed: false, partial: false, perfect: false },
      { letter: "I", guessed: false, partial: false, perfect: false },
      { letter: "O", guessed: false, partial: false, perfect: false },
      { letter: "P", guessed: false, partial: false, perfect: false }
    ];

    keyBoard.rows[1].keys = [
      { letter: "A", guessed: false, partial: false, perfect: false },
      { letter: "S", guessed: false, partial: false, perfect: false },
      { letter: "D", guessed: false, partial: false, perfect: false },
      { letter: "F", guessed: false, partial: false, perfect: false },
      { letter: "G", guessed: false, partial: false, perfect: false },
      { letter: "H", guessed: false, partial: false, perfect: false },
      { letter: "J", guessed: false, partial: false, perfect: false },
      { letter: "K", guessed: false, partial: false, perfect: false },
      { letter: "L", guessed: false, partial: false, perfect: false },
      { letter: ENTER, guessed: false, partial: false, perfect: false },
    ];

    keyBoard.rows[2].keys = [
      { letter: "Z", guessed: false, partial: false, perfect: false },
      { letter: "X", guessed: false, partial: false, perfect: false },
      { letter: "C", guessed: false, partial: false, perfect: false },
      { letter: "V", guessed: false, partial: false, perfect: false },
      { letter: "B", guessed: false, partial: false, perfect: false },
      { letter: "N", guessed: false, partial: false, perfect: false },
      { letter: "M", guessed: false, partial: false, perfect: false },
      { letter: BACKSPACE, guessed: false, partial: false, perfect: false }
    ];

    this.keyboard.next(keyBoard);
  }

  public registerKeys(guess: string, partialClues: string[], perfectClues: string[]): void {
    let keyBoard = this.keyboard.value;

    for (let i = 0; i < guess.length; i++) {
      let letter = guess[i];
      let partial = partialClues.indexOf(letter) > -1;
      let perfect = perfectClues.indexOf(letter) > -1;

      let key = this.getKey(keyBoard, letter);

      if (key) {
        key.perfect = perfect;
        key.partial = partial;
        key.guessed = true;
      }
    }

    this.keyboard.next(keyBoard);
  }

  private getKey(keyBoard: Keyboard, letter: string): Key | null {   
    for (let i = 0; i < keyBoard.rows.length; i++) {
      let row = keyBoard.rows[i];

      let keyBoardKey = row.keys.find(key => key.letter === letter);

      if (keyBoardKey) {
        return keyBoardKey;
      }
    }

    return null;
  }

}
