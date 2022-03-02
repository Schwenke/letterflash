import {Component, OnInit} from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { ThreeStarSymbol, TwoStarSymbol, GreenBlock, GreyBlock, OneStarSymbol, YellowBlock } from 'src/app/constants';
import { BoardState, Letter } from 'src/app/models/board-state.interface';
import { Options } from 'src/app/models/options.interface';
import { Session } from 'src/app/models/session.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-victory-dialog',
  templateUrl: './victory-dialog.component.html',
  styleUrls: ['./victory-dialog.component.scss']
})

export class VictoryDialogComponent implements OnInit {

  boardState: BoardState;
  session: Session;
  timeSpent: string = "";
  mode: string = "Default";

  constructor(
    private timerService: TimerService,
    private boardStateService: BoardStateService,
    private sessionService: SessionService,
    public dialogRef: MatDialogRef<VictoryDialogComponent>
  ) {}

  ngOnInit(): void {
    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.sessionService.session.subscribe(session => {
        if (!session) return;

        this.boardState = boardState;
        this.session = session;
        this.setModeMessage();
        this.timeSpent = this.timerService.getClockTime();
      });
    })
  }

  private setModeMessage(): void {
    let options: Options = this.session.options;

    if (options.hardMode && options.extremeMode) {
      this.mode = "Hard mode, Extreme mode";
    } else if (options.hardMode) {
      this.mode = "Hard mode";
    } else if (options.extremeMode) {
      this.mode = "Extreme mode";
    } else {
      this.mode = "Default";
    }
  }

  public copyToClipboard(): void {
    let text: string = this.generateEmojis();
    this.writeToClipboard(text);
  }

  public reset(): void {
    this.boardStateService.startNewGame();
    this.dialogRef.close();
  }

  // best function ever
  private generateEmojis(): string {
    let message: string = "";
    let secret: string = this.session.secret;

    let modeOptions: string = this.getModeOptionString();
    
    message += `${secret} (${this.boardState.rowIndex}/${6}) ${modeOptions}\n`;

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
