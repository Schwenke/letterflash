import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogData } from 'src/app/models/dialog-data.interface';
import { TimeSpan } from 'src/app/models/watch.interface';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-failure-dialog',
  templateUrl: './failure-dialog.component.html',
  styleUrls: ['./failure-dialog.component.scss']
})

export class FailureDialogComponent implements OnInit {
  constructor(
    private timerService: TimerService,
    public dialogRef: MatDialogRef<FailureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(): void {

  }

  public formatClock(timeSpan: TimeSpan): string {
    return this.timerService.formatClock(timeSpan);
  }

  public resetBoard(): void {
    this.dialogRef.close(true);
  }

}
