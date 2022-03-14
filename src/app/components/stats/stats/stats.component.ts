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
    return this.stats.played_5 + this.stats.played_6 + this.stats.played_7;
  }

}
