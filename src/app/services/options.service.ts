import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Options } from '../models/options.interface';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

  options: ReplaySubject<Options> = new ReplaySubject<Options>();

  constructor(
    private sessionService: SessionService
  ) {   
    let options: Options | null;

    options = this.sessionService.getOptions();

    if (!options) {
      options = this.getDefaultOptions();
    }

    this.options.next(options);
  }

  private getDefaultOptions(): Options {
    return {
      hardMode: false,
      wordLength: "5"
    };
  }
}
