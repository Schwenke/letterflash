import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Letter } from 'src/app/models/board-state.interface';
import { DialogData } from 'src/app/models/dialog-data.interface';
import { TimeSpan } from 'src/app/models/watch.interface';
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

  constructor(
    private timerService: TimerService,
    public dialogRef: MatDialogRef<VictoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(): void {

  }

  public formatClock(timeSpan: TimeSpan): string {
    return this.timerService.formatClock(timeSpan);
  }

  public copyToClipboard(): void {
    let text: string = this.generateEmojis();
    this.writeToClipboard(text);
    this.dialogRef.close();
  }

  // best function ever
  private generateEmojis(): string {
    let guesses = this.data.guessIndex;
    let message: string = `${this.data.secretWord} (${guesses}/${this.data.maxGuesses})\n`;

    for (let i = 0; i < this.data.guessIndex; i++) {
      let word = this.data.boardState.words[i];

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

  //  todo - append button to success message.
  //  Build emoji block - Word + blocks line by line
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
