import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, timestamp, Timestamp } from 'rxjs';
import { TimeSpan } from '../models/watch.interface';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  running: boolean = false;
  time: number = 0;
  timeSpan: BehaviorSubject<TimeSpan> = new BehaviorSubject<TimeSpan>({hours: 0, minutes: 0, seconds: 0});

  constructor() { 
    timer(0, 1000).subscribe(ellapsedCycles => {
      if (this.running) {
        this.time++;
        let timeSpan = this.getTimeSpan(this.time);
        this.timeSpan.next(timeSpan);
      }
    });
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
  }

  public reset(): void {
    this.time = 0;
  }

  public getSeconds(): number {
    return this.time;
  }

  public getClockTime(): string {
    return this.formatClockTime(this.time);
  }

  public formatClockTime(time: number): string {
    let timeSpan: TimeSpan = this.getTimeSpan(time);

    let hours = timeSpan.hours > 9 ? timeSpan.hours : `0${timeSpan.hours}`;
    let minutes = timeSpan.minutes > 9 ? timeSpan.minutes : `0${timeSpan.minutes}`;
    let seconds = timeSpan.seconds > 9 ? timeSpan.seconds : `0${timeSpan.seconds}`;

    return `${hours}:${minutes}:${seconds}`;
  }

  private getTimeSpan(time: number): TimeSpan {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = Math.floor(time % 3600 % 60);

    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }
}
