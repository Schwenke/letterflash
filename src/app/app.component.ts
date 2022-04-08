import { Component, HostBinding, ViewChild } from '@angular/core';
import { BoardState, GameStatus } from './models/board-state.interface';
import { BoardStateService } from './services/board-state.service';
import { DictionaryService } from './services/dictionary.service';
import { SessionService } from './services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { ResultsDialogComponent } from './components/results-dialog/results-dialog.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav } from '@angular/material/sidenav';
import { Session } from './models/session.interface';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BaseURL, ShareParameter, SiteName } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  //  Used to swap between dark/light mode themes
  @HostBinding('class') className = '';
  @ViewChild('options') optionSideNav: MatSidenav;

  //  Views
  showGame: boolean = true;
  showHistory: boolean = false;
  showStats: boolean = false;

  //  Dark mode
  darkModeClass: string = "darkMode";
  darkMode: boolean = false;

  //  App state
  initialized: boolean = false;
  showError: boolean = false;
  boardState: BoardState;
  session: Session;

  constructor(
    private dictionaryService: DictionaryService,
    private sessionService: SessionService,
    private boardStateService: BoardStateService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private metaService: Meta,
    private titleService: Title
  ) {
    this.setSiteTags();
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

        this.activatedRoute.queryParamMap.subscribe(params => {
          let shareLink = params.get(ShareParameter);
          this.startGame(shareLink);
        });
      })
    });

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;

      if (this.isGameOver()) {
        this.openResultsDialog();
      }

      if (boardState.error.length > 0) {
        this.showErrorMessage(boardState.error);
      }
    })
  }

  private startGame(shareLink: string | null): void {
    if (!shareLink || shareLink.length === 0) {
      this.boardStateService.initialize();
    } else {
      try {
        let secret: string = atob(shareLink);
        this.boardStateService.startSharedGame(secret);
      } catch(ex) {
        //  Possibly mutated or incorrect format
        this.showErrorMessage("Invalid share link");
        this.boardStateService.initialize();
      } finally {
        //  Clear the URL parameter
        window.history.pushState({}, document.title, "/");
      }
    }
  }

  isGameOver(): boolean {
    return this.boardState.gameStatus !== GameStatus.Active;
  }

  private setSiteTags(): void {
    //  Title
    this.titleService.setTitle(SiteName);

    //  Charset
    this.metaService.addTag({ charset: "utf-8" });

    //  Misc
    this.metaService.addTag({ name: "description", content: "An open source word puzzle game you can share with friends" });
    this.metaService.addTag({ name: "viewport", content: "webswidth=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0ite" });
    this.metaService.addTag({ name: "author", content: "Ben Schwenke" });
    this.metaService.addTag({ name: "twitter:card", content: "summary_large_image" });

    //  OpenGraph
    this.metaService.addTag({ property: "og:type", content: "website" });
    this.metaService.addTag({ property: "og:title", content: SiteName });
    this.metaService.addTag({ property: "og:description", content: "An open source word puzzle game you can share with friends" });
    this.metaService.addTag({ property: "og:url", content: BaseURL });
    this.metaService.addTag({ property: "og:image", content: "https://i.imgur.com/P5hzOI8.png" });
  }

  viewGame(): void {
    this.showHistory = false;
    this.showStats = false;
    this.showGame = true;
  }

  viewHistory(): void {
    if (this.showGame || this.showStats) {
      this.optionSideNav.toggle();
    }

    this.showGame = false;
    this.showStats = false;
    this.showHistory = true;
  }

  viewStats(): void {
    if (this.showGame || this.showHistory) {
      this.optionSideNav.toggle();
    }

    this.showGame = false;
    this.showHistory = false;
    this.showStats = true;
  }

  startNewGame(): void {
    this.optionSideNav.toggle();
    this.boardStateService.startNewGame();
  }

  concede(): void {
    this.optionSideNav.toggle();
    this.boardStateService.concede();
  }

  viewResults(): void {
    this.optionSideNav.toggle();
    this.openResultsDialog();
  }

  openResultsDialog(): void {
    const dialogRef = this.dialog.open(ResultsDialogComponent, {});

    dialogRef.afterClosed().subscribe(startNewGame => {
      if (startNewGame) {
        this.boardStateService.startNewGame();
      }
    });
  }

  showErrorMessage(errorMessage: string): void {
    //  Already showing it
    if (this.showError) return;

    this.showError = true;

    let snackbarBodyClass: string = this.darkMode ? "error-snackbar--dark" : "error-snackbar";

    this.snackBar.open(errorMessage, "Dismiss", { panelClass: snackbarBodyClass, verticalPosition: "top", horizontalPosition: "center", duration: 2500 });

    //  Give animation time to play and finish
    setTimeout(() => {
      this.showError = false;
    }, 1000);
  }
}
