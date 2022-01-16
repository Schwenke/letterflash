import { Component, OnInit } from '@angular/core';
import { Options } from 'src/app/models/options.interface';
import { BoardStateService } from 'src/app/services/board-state.service';
import { OptionsService } from 'src/app/services/options.service';
import { TimerService } from 'src/app/services/timer.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  options: Options = {} as Options;

  clockTime: string = "";

  constructor(
    private optionsService: OptionsService,
    private timerService: TimerService,
    private boardStateService: BoardStateService
  ) { }

  ngOnInit(): void {
    this.optionsService.options.subscribe(options => {
      this.options = options;
    });

    this.timerService.timeSpan.subscribe(time => {
      this.clockTime = this.timerService.getClockTime();
    });
  }

  reset(): void {
    this.boardStateService.reset();
  }

}
