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
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BaseURL, ShareParameter, SiteName } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class') className = '';
  @ViewChild('options') optionSideNav: MatSidenav;

  initialized: boolean = false;
  //  Views - TODO find an elegant way to just swap out entire main body component
  showGame: boolean = true;
  showHistory: boolean = false;
  showStats: boolean = false;

  questionIcon = faQuestionCircle;
  cogsIcon = faCogs;
  darkModeClass: string = "darkMode";
  darkMode: boolean = false;
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

          if (shareLink && shareLink.length > 0) {
            let secret: string = atob(shareLink);
            this.boardStateService.startSharedPuzzle(secret);
          } else {
            this.boardStateService.initialize();
          }
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
        this.openErrorDialog();
      }
    })
  }

  isGameOver(): boolean {
    return (this.boardState.success || this.boardState.failure);
  }

  private setSiteTags(): void {
    //  Title
    this.titleService.setTitle(SiteName);

    //  Charset
    this.metaService.addTag({ charset: "utf-8" });

    //  Misc
    this.metaService.addTag({ name: "viewport", content: "webswidth=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0ite" });
    this.metaService.addTag({ name: "keywords", content: "game, wordle, word, words, letterflash, letter, flash" });
    this.metaService.addTag({ name: "author", content: "Ben Schwenke" });
    this.metaService.addTag({ name: "twitter:card", content: "summary_large_image" });

    //  OpenGraph
    this.metaService.addTag({ property: "og:type", content: "website" });
    this.metaService.addTag({ property: "og:title", content: SiteName });
    this.metaService.addTag({ property: "og:description", content: "An open source, replayable word game you can share with friends" });
    this.metaService.addTag({ property: "og:url", content: BaseURL });
    this.metaService.addTag({ property: "og:image", content: "https://i.imgur.com/P5hzOI8.png" });
  }

  viewGame(): void {
    this.showHistory = false;
    this.showStats = false;
    this.showGame = true;
  }

  viewHistory(): void {
    if (this.showGame) {
      this.optionSideNav.toggle();
    }

    this.showGame = false;
    this.showStats = false;
    this.showHistory = true;
  }

  viewStats(): void {
    if (this.showGame) {
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

  viewResults(): void {
    this.optionSideNav.toggle();
    this.openResultsDialog();
  }

  openResultsDialog(): void {
    const dialogRef = this.dialog.open(ResultsDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boardStateService.startNewGame();
      }
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

    this.snackBar.open(error, "OK", { panelClass: panelClasses, verticalPosition: "top", horizontalPosition: "center", duration: 2000 });

    //  Give animation time to play and finish
    setTimeout(() => {
      this.showError = false;
    }, 1000);
  }
}
