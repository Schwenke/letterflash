import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/models/session.interface';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  stats: Stats;

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(session => {
      this.stats = session.stats;
    })
  }

  getTotalGames(): number {
    let totalGamesPlayed = this.stats.played_5 + this.stats.played_6 + this.stats.played_7;

    if (!totalGamesPlayed) return 0;

    return totalGamesPlayed;
  }

  getTotalWins(): number {
    let totalGamesWon = this.stats.wins_5 + this.stats.wins_6 + this.stats.wins_7;

    if (!totalGamesWon) return 0;

    return totalGamesWon;
  }

  getAverageWinPercent(): string {
    let gamesPlayed = this.getTotalGames();
    let gamesWon = this.getTotalWins();

    if (!gamesPlayed || !gamesWon) return "0";

    return (gamesWon / gamesPlayed).toFixed(2);
  }

  getAverageGuesses(): string {
    let gamesPlayed = this.getTotalGames();

    if (!gamesPlayed) return "0";

    return (this.stats.guesses / gamesPlayed).toFixed(2);
  }

  getTotalTimePlayed(): string {
    let totalSeconds = this.stats.time;

    if (!totalSeconds || totalSeconds === 0) return "00:00:00";

    let hours   = Math.floor(totalSeconds / 3600); // get hours
    let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60); // get minutes
    let seconds = totalSeconds - (hours * 3600) - (minutes * 60); //  get seconds

    let hourString = hours < 10 ? `0${hours}` : `${hours}`;
    let minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
    let secondString = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${hourString}:${minuteString}:${secondString}`;
  }

  getAverageSharePuzzleWinPercent(): string {
    let sharesPlayed = this.stats.shares;

    if (!sharesPlayed || !this.stats.sharesWon) return "0";

    return (this.stats.sharesWon / sharesPlayed).toFixed(2);
  }

  formatNumber(value: number): number {
    if (!value) return 0;

    return value;
  }

}
