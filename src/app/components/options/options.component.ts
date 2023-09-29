import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BoardStateService } from 'src/app/services/board-state.service';
import { SessionService } from 'src/app/services/session.service';
import { GameStatus } from 'src/app/models/board-state.interface';
import { combineLatest } from 'rxjs';
import { Options } from 'src/app/models/options.interface';

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
  disableConcede: boolean = false;

  constructor(
    boardStateService: BoardStateService,
    private sessionService: SessionService
  ) {
    combineLatest([sessionService.session, boardStateService.boardState]).subscribe(([session, boardState]) => {
      this.options = session.options;
      this.disableConcede = (boardState.gameStatus !== GameStatus.Active || session.guesses.length === 0);
    });
  }

  ngOnInit(): void {

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
