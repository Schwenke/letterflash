import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Options } from '../models/options.interface';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

  options: ReplaySubject<Options> = new ReplaySubject<Options>();

  constructor() { 
    //  todo - check session (local storage) for anything stored
    
    this.setDefaultOptions();
  }

  private setDefaultOptions(): void {
    let defaultOptions = {
      hardMode: false,
      wordLength: "5"
    }

    this.options.next(defaultOptions);
  }
}
