import {Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { BoardState, Letter } from 'src/app/models/board-state.interface';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-victory-dialog',
  templateUrl: './victory-dialog.component.html',
  styleUrls: ['./victory-dialog.component.scss']
})

export class VictoryDialogComponent implements OnInit {

  //  emojis :eyes:
  private perfectBlock = "🟩";
  private greyBlock = "⬜";
  private partialBlock = "🟨";

  boardState: BoardState = {} as BoardState;
  options: Options = {} as Options;
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
        this.options = session.options;
        this.setModeMessage();
        this.timeSpent = this.timerService.getClockTime();
      });
    })
  }

  private setModeMessage(): void {
    if (this.options.hardMode && this.options.extremeMode) {
      this.mode = "Hard mode, Extreme mode";
    } else if (this.options.hardMode) {
      this.mode = "Hard mode";
    } else if (this.options.extremeMode) {
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
    this.boardStateService.reset();
    this.dialogRef.close();
  }

  // best function ever
  private generateEmojis(): string {
    let message: string = "";

    let modeOptions: string = this.getModeOptionString();
    
    message += `${this.boardState.secretWord} (${this.boardState.rowIndex}/${6}) ${modeOptions}\n`;

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
    if (this.options.hardMode && this.options.extremeMode) return "⁂";
    if (this.options.extremeMode) return "⁑";
    if (this.options.hardMode) return "⁕";

    return "";
  }

  private writeToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(function () {

    }, function () {

    });
  }


  private getBlock(letter: Letter): string {
    if (letter.perfect) {
      return this.perfectBlock;
    } else if (letter.partial) {
      return this.partialBlock;
    } else {
      return this.greyBlock;
    }
  }

}
