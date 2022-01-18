import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  @Output() resetClicked = new EventEmitter<boolean>();

  options: Options = {} as Options;

  clockTime: string = "";

  constructor(
    private timerService: TimerService,
    private boardStateService: BoardStateService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(session => {
      if (!session) return;
      
      this.options = session.options;

      this.sessionService.saveSession();
    });

    this.timerService.timeSpan.subscribe(time => {
      this.clockTime = this.timerService.getClockTime();
    });
  }

  reset(): void {
    this.boardStateService.reset();
    this.resetClicked.emit(true);
  }

  storeOptions(): void {
    this.sessionService.saveSession();
  }

}
