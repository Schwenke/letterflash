import { Component, HostBinding, HostListener, ViewChild } from '@angular/core';
import { BoardState } from './models/board-state.interface';
import { BoardStateService } from './services/board-state.service';
import { DictionaryService } from './services/dictionary.service';
import { SessionService } from './services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { VictoryDialogComponent } from '../app/components/victory-dialog/victory-dialog.component'
import { FailureDialogComponent } from '../app/components/failure-dialog/failure-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faQuestionCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class') className = '';
  @ViewChild('options') options: MatSidenav;

  initialized: boolean = false;
  showGame: boolean = true;
  darkModeClass: string = "darkMode";
  boardState: BoardState;
  questionIcon = faQuestionCircle;
  cogsIcon = faCogs;
  darkMode: boolean = false;

  constructor(
    private dictionaryService: DictionaryService,
    private sessionService: SessionService,
    private boardStateService: BoardStateService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.dictionaryService.initialized.subscribe(dictionaryReady => {
      if (!dictionaryReady) return;

      this.sessionService.session.subscribe(session => {
        if (!session) return;

        this.darkMode = session.options.darkMode;
        
        this.className = this.darkMode ? this.darkModeClass : "";

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

      if (boardState.error.length > 0) {
        this.openErrorDialog();
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
    if (this.showGame) {
      this.options.toggle();
    }

    this.showGame = !this.showGame;
  }

  viewResults(): void {
    this.options.toggle();
    
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

  openErrorDialog(): void {
    let error: string = this.boardState.error;

    this.snackBar.open(error, "OK", {verticalPosition: "top", horizontalPosition: "center", duration: 1500});
  }
}
