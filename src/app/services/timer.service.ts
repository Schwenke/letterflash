import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  running: boolean = false;
  time: number = 0;
  formattedTime: BehaviorSubject<string> = new BehaviorSubject<string>("00:00:00");

  constructor() { 
    timer(0, 1000).subscribe(ellapsedCycles => {
      if (this.running) {
        this.time++;
        this.formattedTime.next(this.formatClockTime(this.time));
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

  public formatClockTime(time: number): string {
    let hours = `${Math.floor(time / 3600)}`.padStart(2, "0");
    let minutes = `${Math.floor(time % 3600 / 60)}`.padStart(2, "0");
    let seconds = `${Math.floor(time % 3600 % 60)}`.padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }
}
