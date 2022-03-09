import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';
import { faClock } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  @Output() newGameClicked = new EventEmitter<boolean>();
  @Output() viewHistoryClicked = new EventEmitter<boolean>();
  @Output() viewResultsClicked = new EventEmitter<boolean>();
  @Output() closeButtonClicked = new EventEmitter<boolean>();

  options: Options = {} as Options;
  gamePaused: boolean = false;
  clockIcon = faClock;

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
    });

    this.timerService.timeSpan.subscribe(time => {
      this.clockTime = this.timerService.getClockTime();
    });

    this.boardStateService.boardState.subscribe(boardState => {
      this.gamePaused = boardState.success || boardState.failure;
    });
  }

  closePanel(): void {
    this.closeButtonClicked.emit(true);
  }

  startNewGame(): void {
    this.newGameClicked.emit(true);
  }

  viewHistory(): void {
    this.viewHistoryClicked.emit(true);
  }

  viewResults(): void {
    this.viewResultsClicked.emit(true);
  }

  storeOptions(): void {
    this.sessionService.save();
    this.sessionService.refresh();
  }
}
