import { Component, OnInit } from '@angular/core';
import { BoardStateService } from 'src/app/services/board-state.service';
import { BoardState } from 'src/app/models/board-state.interface';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})

export class GameBoardComponent implements OnInit {
  boardState: BoardState = {} as BoardState;

  constructor(
    private boardStateService: BoardStateService
  ) {

  }

  ngOnInit(): void {
    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;
    });
  }
}
