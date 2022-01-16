import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BoardState } from './models/board-state.interface';
import { BoardStateService } from './services/board-state.service';
import { DictionaryService } from './services/dictionary.service';
import { OptionsService } from './services/options.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  initialized: boolean = false;
  boardState: BoardState;

  constructor(
    private dictionaryService: DictionaryService,
    private optionsService: OptionsService,
    private boardStateService: BoardStateService
  ) {

  }

  ngOnInit(): void {
    this.dictionaryService.initialized.subscribe(dictionaryReady => {
      if (!dictionaryReady) return;

      this.optionsService.options.subscribe(options => {
        if (!options) return;
        if (this.initialized) return;

        this.initialized = true;

        this.boardStateService.reset();
      })
    });

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;
    })
  }

  // Ensure the user doesn't accidentally toggle the side nav after clicking options and then hitting ENTER to submit a guess
  buttonKeyDown(event: KeyboardEvent) {
    event.preventDefault();
  }
}
