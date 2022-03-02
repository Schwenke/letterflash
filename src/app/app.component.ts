import { Component, HostBinding, ViewChild } from '@angular/core';
import { BoardState } from './models/board-state.interface';
import { BoardStateService } from './services/board-state.service';
import { DictionaryService } from './services/dictionary.service';
import { SessionService } from './services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { ResultsDialogComponent } from './components/results-dialog/results-dialog.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { faQuestionCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { MatSidenav } from '@angular/material/sidenav';
import { Session } from './models/session.interface';

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
  showError: boolean = false;
  session: Session;

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

        this.session = session;

        this.darkMode = session.options.darkMode;
        
        this.className = this.darkMode ? this.darkModeClass : "";

        if (this.initialized) return;

        this.initialized = true;

        this.boardStateService.initialize();
      })
    });

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;

      if (boardState.success) {
        this.openResultsDialog();
      }

      if (boardState.failure) {
        this.openResultsDialog();
      }

      if (boardState.error.length > 0) {
        this.openErrorDialog();
      }
    })
  }

  switchViews(): void {
    if (this.showGame) {
      this.options.toggle();
    }

    this.showGame = !this.showGame;
  }

  viewResults(): void {
    this.options.toggle();
    
    this.openResultsDialog();
  }
  
  openResultsDialog(): void {
    const dialogRef = this.dialog.open(ResultsDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openErrorDialog(): void {
    //  Already showing it
    if (this.showError) return;

    this.showError = true;

    let error: string = this.boardState.error;

    let snackbarBodyClass: string = this.darkMode ? "error-snackbar-body--dark" : "error-snackbar-body";
    let snackbarTextClass: string = "error-snackbar-text";
    let panelClasses: string[] = [snackbarBodyClass, snackbarTextClass];

    this.snackBar.open(error, "OK", {panelClass: panelClasses, verticalPosition: "top", horizontalPosition: "center", duration: 2000});
    
    //  Give animation time to play and finish
    setTimeout(() => {
      this.showError = false;
    }, 1000);
  }
}
