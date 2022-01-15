import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Leader, LeaderBoard } from '../models/leader-board.interface';

@Injectable({
  providedIn: 'root'
})
export class LeaderBoardService {

  private leaderBoardCache: BehaviorSubject<LeaderBoard> = new BehaviorSubject<LeaderBoard>({} as LeaderBoard);

  constructor() { 
    //  todo - do we just store leaders in a local fle somewhere?
    let leaderBoard = this.leaderBoard.value;

    leaderBoard.leaders = [];

    this.leaderBoardCache.next(leaderBoard);
  }

  get leaderBoard() {
    return this.leaderBoardCache;
  }

  public registerPlayer(leader: Leader) {
    let leaderBoard = this.leaderBoard.value;

    leaderBoard.leaders.push(leader);

    this.leaderBoardCache.next(leaderBoard);

    this.sortLeaderBoard();
  }

  private sortLeaderBoard(): void {
    let leaderBoard = this.leaderBoard.value;

    leaderBoard.leaders.sort((player1, player2) =>     
      player1.time.hours - player2.time.hours |
      player1.time.minutes - player2.time.minutes |
      player1.time.seconds - player2.time.seconds |
      player1.guesses.length - player2.guesses.length
    );

    this.leaderBoardCache.next(leaderBoard);
  }
}
