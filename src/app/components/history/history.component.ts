import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/models/session.interface';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  previousGames: Game[];

  constructor(
    private sessionService: SessionService

  ) { }

  ngOnInit(): void {
    this.sessionService.session.subscribe(session => {
      this.previousGames = session.previousGames;
    });
  }

}
