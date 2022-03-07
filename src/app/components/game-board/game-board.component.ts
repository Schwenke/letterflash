import { Component, OnInit } from '@angular/core';
import { BoardStateService } from 'src/app/services/board-state.service';
import { BoardState, Letter } from 'src/app/models/board-state.interface';
import { SessionService } from 'src/app/services/session.service';
import { Options } from 'src/app/models/options.interface';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})

export class GameBoardComponent implements OnInit {
  boardState: BoardState = {} as BoardState;
  options: Options;

  constructor(
    private boardStateService: BoardStateService,
    private sessionService: SessionService
  ) {

  }

  ngOnInit(): void {
    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;
    });

    this.sessionService.session.subscribe(session => {
      if (!session) return;
      
      this.options = session.options;
    })
  }

  getTitle(letter: Letter): string {
    if (letter.perfect) {
      return `${letter.letter} perfect`;
    } else if (letter.partial) {
      return `${letter.letter} partial`;
    } else {
      return `${letter.letter}`;
    }
  }
}
