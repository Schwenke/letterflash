import {Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-failure-dialog',
  templateUrl: './failure-dialog.component.html',
  styleUrls: ['./failure-dialog.component.scss']
})

export class FailureDialogComponent implements OnInit {
  secretWord: string = "";
  timeSpent: string = "";

  constructor(
    private timerService: TimerService,
    public dialogRef: MatDialogRef<FailureDialogComponent>,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.sessionService.session.subscribe(session => {
      if (!session) return;

      this.timeSpent = this.timerService.getClockTime();
      this.secretWord = session.secret;
    });
  }

  public resetBoard(): void {
    this.dialogRef.close(true);
  }

}
