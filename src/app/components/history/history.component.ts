import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Game } from 'src/app/models/session.interface';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<Game>;

  displayedColumns: string[] = ['date', 'secret', 'guesses', 'time-spent', 'win', 'options', 'share'];

  resultCount: number = 4;

  constructor(
    private sessionService: SessionService

  ) {
    this.dataSource = new MatTableDataSource<Game>();

    this.sessionService.session.subscribe(session => {
      this.dataSource.data = session.recentGames;
    });
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  trimOption(option: string): string {
    return option.replace(" mode", "");
  }

  copyShareLink(word: string): void {
    let link: string =  this.sessionService.getShareLink(word);

    navigator.clipboard.writeText(link);
  }

  getResultCount(): number[] {
    return [this.resultCount];
  }

  getGameTime(game: Game): string {
    return this.sessionService.formatClockTime(game.time);
  }

  getValidGuesses(guesses: string[]): string[] {
    return guesses.filter(guess => guess.trim() !== "");
  }

}
