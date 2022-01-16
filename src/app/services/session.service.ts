import { Injectable } from '@angular/core';
import { Options } from '../models/options.interface';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private optionsKey = "uwg-options";

  constructor() { 
    
  }

  storeOptions(options: Options): void {
    let jsonValue = JSON.stringify(options);

    localStorage.setItem(this.optionsKey, jsonValue);
  }

  getOptions(): Options | null {
    let optionsJSON = localStorage.getItem(this.optionsKey);

    if (optionsJSON) {
      return JSON.parse(optionsJSON);
    }

    return null;
  }
}
