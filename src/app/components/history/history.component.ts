import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Game } from 'src/app/models/session.interface';
import { SessionService } from 'src/app/services/session.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<Game>;

  displayedColumns: string[] = ['date', 'secret', 'guesses', 'time-spent', 'win', 'options', 'share'];

  resultCount: number = 5;

  constructor(
    private sessionService: SessionService,
    private timerService: TimerService

  ) {
    this.getScreenSize();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Game>();

    this.sessionService.session.subscribe(session => {
      this.dataSource.data = session.recentGames;
    });
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

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
        let screenHeight = window.innerHeight;

        if (screenHeight < 800) {
          this.resultCount = 4;
        }

        if (screenHeight < 650) {
          this.resultCount = 3;
        }
  }

  getResultCount(): number[] {
    return [this.resultCount];
  }

  getGameTime(game: Game): string {
    return this.timerService.formatClockTime(game.time);
  }

}
