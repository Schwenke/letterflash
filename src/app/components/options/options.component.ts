import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';
import { GameStatus } from 'src/app/models/board-state.interface';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  @Output() newGameClicked = new EventEmitter<boolean>();
  @Output() concedeClicked = new EventEmitter<boolean>();
  @Output() viewHistoryClicked = new EventEmitter<boolean>();
  @Output() viewStatsClicked = new EventEmitter<boolean>();
  @Output() closeButtonClicked = new EventEmitter<boolean>();

  options: Options = {} as Options;
  gameOver: boolean = false;

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

    this.timerService.formattedTime.subscribe(time => {
      this.clockTime = time;
    });

    this.boardStateService.boardState.subscribe(boardState => {
      this.gameOver = boardState.gameStatus !== GameStatus.Active;
    });
  }

  closePanel(): void {
    this.closeButtonClicked.emit(true);
  }

  startNewGame(): void {
    this.newGameClicked.emit(true);
  }

  concede(): void {
    this.concedeClicked.emit(true);
  }

  viewHistory(): void {
    this.viewHistoryClicked.emit(true);
  }

  viewStats(): void {
    this.viewStatsClicked.emit(true);
  }

  storeOptions(): void {
    this.sessionService.save(true);
  }
}
