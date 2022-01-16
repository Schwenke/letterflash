import {Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { BoardState, Letter } from 'src/app/models/board-state.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-victory-dialog',
  templateUrl: './victory-dialog.component.html',
  styleUrls: ['./victory-dialog.component.scss']
})

export class VictoryDialogComponent implements OnInit {

  //  emojis :eyes:
  private greenBlock = "🟩";
  private greyBlock = "⬜";
  private purpleBlock = "🟪";

  boardState: BoardState = {} as BoardState;
  timeSpent: string = "";

  constructor(
    private timerService: TimerService,
    private boardStateService: BoardStateService,
    public dialogRef: MatDialogRef<VictoryDialogComponent>
  ) {}

  ngOnInit(): void {
    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;
      this.timeSpent = this.timerService.getClockTime();
    })
  }

  public copyToClipboard(): void {
    let text: string = this.generateEmojis();
    this.writeToClipboard(text);
    this.dialogRef.close();
  }

  // best function ever
  private generateEmojis(): string {
    let message: string = `${this.boardState.secretWord} (${this.boardState.rowIndex}/${6})\n`;

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

  private writeToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(function () {

    }, function () {

    });
  }


  private getBlock(letter: Letter): string {
    if (letter.perfect) {
      return this.greenBlock;
    } else if (letter.partial) {
      return this.purpleBlock;
    } else {
      return this.greyBlock;
    }
  }

}
