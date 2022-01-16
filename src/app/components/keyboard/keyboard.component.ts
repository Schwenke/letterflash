import { Component, HostListener, OnInit } from '@angular/core';
import { Keyboard } from 'src/app/models/keyboard.interface';
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

  constructor(
    private keyboardService: KeyboardService,
    private boardStateService: BoardStateService
  ) { }

  ngOnInit(): void {
    this.keyboardService.keyboard.subscribe(keyboard => {
      this.keyboard = keyboard;
    });
  }

  @HostListener('window:keyup', ['$event'])
  handleInput(event: KeyboardEvent): void {
    if (event.key === this.enterKey) {
      this.boardStateService.guess();
    } else if (event.key === this.backspaceKey) {
      this.boardStateService.removeInput();
    } else {
      this.boardStateService.appendInput(event.key);
    }
  }

}
