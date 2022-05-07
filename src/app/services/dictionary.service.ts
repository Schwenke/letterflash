import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { SessionService } from './session.service';
import { Session } from '../models/session.interface';
import { FiveLetterDictionaryURL, FullDictionaryURL, SevenLetterDictionaryURL, SixLetterDictionaryURL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  public initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private dictionary: string[] = [];
  cache: Map<number, string[]> = new Map<number, string[]>();
  session: Session;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
    ) { 

    this.sessionService.session.subscribe(session => {
      this.session = session;
    });

    this.fetchDictionary();
  }

  public generateWord(wordLength: number) {
    let wordList = this.getWordList(wordLength);
    
    let randomIndex = Math.floor(Math.random() * wordList.length);

    let randomWord = wordList[randomIndex];

    return randomWord.toLocaleUpperCase();
  }

  private getWordList(length: number): string[] {
    let wordList;

    if (this.session.options.extremeMode) {
      wordList = this.dictionary.filter(word => word.length === length);
    } else {
      wordList = this.cache.get(length);
    }

    return wordList ? wordList : [];
  }

  public hasWord(word: string): boolean {
    let curatedList: string[] = this.getWordList(word.length);

    //  Check the curated list first since its smaller
    if (curatedList.includes(word.toLocaleLowerCase())) {
      return true;
    }

    //  check the full dictionary
    return this.dictionary.includes(word.toLocaleLowerCase());
  }

  private fetchDictionary(): void {
    const fullDictionary = this.http.get(FullDictionaryURL);
    const fiveLetterWordList = this.http.get(FiveLetterDictionaryURL);
    const sixLetterWordList = this.http.get(SixLetterDictionaryURL);
    const sevenLetterWordList = this.http.get(SevenLetterDictionaryURL);

    forkJoin([fullDictionary, fiveLetterWordList, sixLetterWordList, sevenLetterWordList]).subscribe(data => {
      let dictionary = data[0] as string[];
      let fiveLetterWords = data[1] as string[];
      let sixLetterWords = data[2] as string[];
      let sevenLetterWords = data[3] as string[];

      this.dictionary = dictionary;
      this.cache.set(5, fiveLetterWords);
      this.cache.set(6, sixLetterWords);
      this.cache.set(7, sevenLetterWords);

      this.initialized.next(true);
    });
  }

}