import {Component, OnInit} from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { ThreeStarSymbol, TwoStarSymbol, GreenBlock, GreyBlock, OneStarSymbol, YellowBlock, BaseURL, ShareParameter, MaxGuesses } from 'src/app/constants';
import { BoardState, Letter } from 'src/app/models/board-state.interface';
import { Options } from 'src/app/models/options.interface';
import { Session } from 'src/app/models/session.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-results-dialog',
  templateUrl: './results-dialog.component.html',
  styleUrls: ['./results-dialog.component.scss']
})

export class ResultsDialogComponent implements OnInit {

  boardState: BoardState;
  session: Session;
  message: string = "";
  timeSpent: string = "";
  mode: string = "Default";

  //  button state
  shareResultsText: string = "Share results";
  sharePuzzleText: string = "Share a link to this puzzle";
  shareResultsClicked: boolean = false;
  sharePuzzleClicked: boolean = false;

  constructor(
    private timerService: TimerService,
    private boardStateService: BoardStateService,
    private sessionService: SessionService,
    public dialogRef: MatDialogRef<ResultsDialogComponent>
  ) {}

  ngOnInit(): void {
    this.timeSpent = this.timerService.getClockTime();

    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.sessionService.session.subscribe(session => {
        if (!session) return;

        this.boardState = boardState;
        this.session = session;
        this.setMessage();
      });
    })
  }

  private setMessage(): void {
    if (this.boardState.success) {
      this.message = `Congratulations! You guessed the secret word ${this.session.secret}`;
    } else {
      this.message = `Too bad! You failed to guess the secret word ${this.session.secret}`;
    }
  }

  public shareResults(): void {
    let text: string = this.getResultsText();
    this.writeToClipboard(text);

    this.shareResultsText = "Results copied to clipboard!"
    this.shareResultsClicked = true;
  }

  public reset(): void {
    this.dialogRef.close(true);
  }

  public sharePuzzle(): void {
    let shareLink: string = this.getShareLink();

    this.writeToClipboard(shareLink);

    this.sharePuzzleText = "Share link copied to clipboard!"
    this.sharePuzzleClicked = true;
  }

  private getShareLink(): string {
    let secret: string = this.session.secret;
    let encodedSecret: string = btoa(secret);
    let shareLink: string = `${BaseURL}?${ShareParameter}=${encodedSecret}`;

    return shareLink;
  }

  private getResultsText(): string {
    let message: string = this.getResultsHeader();

    //  Generate the board of emojis
    for (let i = 0; i < this.boardState.rowIndex; i++) {
      let word = this.boardState.words[i];

      for (let k = 0; k < word.letters.length; k++) {
        let letter = word.letters[k];

        message += this.getBlock(letter);
      }

      message += "\n";
    }

    // trim end
    message = message.trim();

    return message;
  }

  private getResultsHeader(): string {
    let secret: string = this.session.secret;
    let modeOptions: string = this.getModeOptionString();
    let guessesMade: string = this.boardState.success ? `${this.boardState.rowIndex}` : "X";
    let customGame: boolean = this.session.customGame;
    let messageHeader: string = "";

    if (customGame) {
      let shareLink: string = this.getShareLink();
      let questionMarks: string = "".padEnd(secret.length, "?");
      messageHeader += `${shareLink}\n`;
      messageHeader += `${questionMarks} (${guessesMade}/${MaxGuesses}) ${modeOptions}\n`;
    } else {
      messageHeader += `${BaseURL}\n`;
      messageHeader += `${secret} (${guessesMade}/${MaxGuesses}) ${modeOptions}\n`;
    }

    return messageHeader;
  }

  private getModeOptionString(): string {
    let options: Options = this.session.options;

    if (options.hardMode && options.extremeMode) return ThreeStarSymbol;
    if (options.extremeMode) return TwoStarSymbol;
    if (options.hardMode) return OneStarSymbol;

    return "";
  }

  private writeToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  private getBlock(letter: Letter): string {
    if (letter.perfect) {
      return GreenBlock;
    } else if (letter.partial) {
      return YellowBlock;
    } else {
      return GreyBlock;
    }
  }

}
