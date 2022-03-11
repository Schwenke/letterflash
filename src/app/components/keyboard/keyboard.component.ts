import { Component, HostListener, OnInit } from '@angular/core';
import { BACKSPACE, ENTER } from 'src/app/constants';
import { BoardState } from 'src/app/models/board-state.interface';
import { Key, Keyboard } from 'src/app/models/keyboard.interface';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { KeyboardService } from 'src/app/services/keyboard.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit {

  // constants
  enterKey: string = "Enter";
  backspaceKey: string = "Backspace";

  //  models
  keyboard: Keyboard = {} as Keyboard;
  boardState: BoardState = {} as BoardState;
  options: Options;

  constructor(
    private keyboardService: KeyboardService,
    private boardStateService: BoardStateService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.keyboardService.keyboard.subscribe(keyboard => {
      if (!keyboard) return;
      
      this.keyboard = keyboard;
    });

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;
    });

    this.sessionService.session.subscribe(session => {
      if (!session) return;

      this.options = session.options;
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleInput(event: KeyboardEvent): void {
    //  Game is in a state of not running - don't accept further keyboard clicks
    if (this.boardState.success || this.boardState.failure) return;

    if (event.key === this.enterKey) {
      this.boardStateService.guess();
    } else if (event.key === this.backspaceKey) {
      this.boardStateService.removeInput();
    } else {
      this.boardStateService.appendInput(event.key);
    }
  }

  keyClicked(key: Key): void {
    //  Game is in a state of not running - don't accept further keyboard clicks
    if (this.boardState.success || this.boardState.failure) return;
    if (key.letter === " ") return;
    
    if (key.letter === ENTER) {
      this.boardStateService.guess();
    } else if (key.letter === BACKSPACE) {
      this.boardStateService.removeInput();
    } else {
      this.boardStateService.appendInput(key.letter);
    }
  }

  getTitle(key: Key): string {
    if (key.letter === ENTER) {
      return "Submits your guess";
    }

    if (key.letter === BACKSPACE) {
      return "Deletes the most recent letter from the current guess";
    }
    
    if (key.perfect) {
      return "This letter is in the secret word and was used in the correct position";
    } else if (key.partial) {
      return "This letter is in the secret word, but not in the correct position";
    } else if (key.guessed) {
      return "This letter has been used and is not in the secret word";
    } else {
      return "This letter has not been used yet";
    }
  }

}
