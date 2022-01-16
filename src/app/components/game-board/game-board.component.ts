import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VictoryDialogComponent } from '../victory-dialog/victory-dialog.component';
import { FailureDialogComponent } from '../failure-dialog/failure-dialog.component';
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
    private boardStateService: BoardStateService,
    public dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.boardStateService.boardState.subscribe(boardState => {
      if (!boardState) return;

      this.boardState = boardState;

      if (boardState.success) {
        this.openVictoryDialog();
      }

      if (boardState.failure) {
        this.openFailureDialog();
      }
    });
  }

  openFailureDialog(): void {
    const dialogRef = this.dialog.open(FailureDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if (result && result === true) {
        this.boardStateService.reset();
      }
    });
  }
  
  openVictoryDialog(): void {
    const dialogRef = this.dialog.open(VictoryDialogComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      //  todo?
    });
  }
}
