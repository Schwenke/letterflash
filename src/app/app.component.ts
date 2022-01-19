import { Component, HostListener } from '@angular/core';
import { BoardState } from './models/board-state.interface';
import { BoardStateService } from './services/board-state.service';
import { DictionaryService } from './services/dictionary.service';
import { SessionService } from './services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { VictoryDialogComponent } from '../app/components/victory-dialog/victory-dialog.component'
import { FailureDialogComponent } from '../app/components/failure-dialog/failure-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  initialized: boolean = false;
  showGame: boolean = true;
  boardState: BoardState;

  constructor(
    private dictionaryService: DictionaryService,
    private sessionService: SessionService,
    private boardStateService: BoardStateService,
    public dialog: MatDialog
  ) {
    //  Ripped from https://css-tricks.com/the-trick-to-viewport-units-on-mobile/

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  ngOnInit(): void {
    this.dictionaryService.initialized.subscribe(dictionaryReady => {
      if (!dictionaryReady) return;

      this.sessionService.session.subscribe(session => {
        if (!session) return;
        if (this.initialized) return;

        this.initialized = true;

        this.boardStateService.reset();
      })
    });

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;

      if (boardState.success) {
        this.openVictoryDialog();
      }

      if (boardState.failure) {
        this.openFailureDialog();
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  updateViewPortHeight(event: any): void {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Ensure the user doesn't accidentally toggle the side nav after clicking options and then hitting ENTER to submit a guess
  buttonKeyDown(event: KeyboardEvent) {
    event.preventDefault();
  }

  switchViews(): void {
    this.showGame = !this.showGame;
  }

  viewResults(): void {
    if (this.boardState.success) {
      this.openVictoryDialog();
    } else {
      this.openFailureDialog();
    }
  }

  openFailureDialog(): void {
    const dialogRef = this.dialog.open(FailureDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result && result === true) {
        this.boardStateService.reset();
      }
    });
  }
  
  openVictoryDialog(): void {
    const dialogRef = this.dialog.open(VictoryDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      //  todo?
    });
  }
}
