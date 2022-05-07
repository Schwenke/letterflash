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

  constructor(
    private sessionService: SessionService
    ) { 
      this.sessionService.session.subscribe(session => {
        this.stats = session.stats;
      });
    }

  ngOnInit(): void {

  }

  getGamesPlayed(): string {
    let fiveLetterGames = this.stats.played_5 ? this.stats.played_5 : 0;
    let sixLetterGames = this.stats.played_6 ? this.stats.played_6 : 0;
    let sevenLetterGames = this.stats.played_7 ? this.stats.played_7 : 0;

    return `${fiveLetterGames} / ${sixLetterGames} / ${sevenLetterGames}`;
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

  getAverageWinPercent(): number {
    let gamesPlayed = this.getTotalGames();
    let gamesWon = this.getTotalWins();

    if (!gamesPlayed || !gamesWon) return 0;

    let averageWinPercent = (gamesWon / gamesPlayed) * 100;

    return Math.floor(averageWinPercent);
  }

  getAverageGuesses(): string {
    let gamesPlayed = this.getTotalGames();

    if (!gamesPlayed) return "0";

    return (this.stats.guesses / gamesPlayed).toFixed(2);
  }

  getAverageGameTime(): string {
    let totalSeconds = this.stats.time_5 + this.stats.time_6 + this.stats.time_7;
    let gamesPlayed = this.getTotalGames();

    if (!totalSeconds || totalSeconds === 0 || gamesPlayed === 0) return "00:00:00";

    let averageSeconds = Math.floor(totalSeconds / gamesPlayed);

    let formattedTime: string = this.sessionService.formatClockTime(averageSeconds);

    return formattedTime;
  }

  getAverageHardModeWinPercent(): number {
    let gamesPlayed = this.stats.played_hard;

    if (!gamesPlayed || !this.stats.wins_hard) return 0;

    let winPercent = (this.stats.wins_hard / gamesPlayed) * 100;

    return Math.floor(winPercent);
  }

  getAverageExtremeModeWinPercent(): number {
    let gamesPlayed = this.stats.played_extreme;

    if (!gamesPlayed || !this.stats.wins_extreme) return 0;

    let winPercent = (this.stats.wins_extreme / gamesPlayed) * 100;

    return Math.floor(winPercent);
  }

  formatNumber(value: number): number {
    if (!value) return 0;

    return value;
  }

}
