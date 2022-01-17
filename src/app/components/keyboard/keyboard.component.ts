import { Component, HostListener, OnInit } from '@angular/core';
import { BoardState } from 'src/app/models/board-state.interface';
import { Key, Keyboard } from 'src/app/models/keyboard.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { KeyboardService } from 'src/app/services/keyboard.service';

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

  constructor(
    private keyboardService: KeyboardService,
    private boardStateService: BoardStateService
  ) { }

  ngOnInit(): void {
    this.keyboardService.keyboard.subscribe(keyboard => {
      this.keyboard = keyboard;
    });

    this.boardStateService.boardState.subscribe(boardState => {
      this.boardState = boardState;
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
    
    if (key.letter === "Enter") {
      this.boardStateService.guess();
    } else if (key.letter === "❌") {
      this.boardStateService.removeInput();
    } else {
      this.boardStateService.appendInput(key.letter);
    }
  }

}
