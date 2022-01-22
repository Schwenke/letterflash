import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Options } from '../models/options.interface';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  public initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private dictionary: string[] = [];
  cache: Map<number, string[]> = new Map<number, string[]>();
  options: Options;

  private fullDictionaryURL = "assets/dictionary.json"
  private fiveLetterDictionaryURL = "assets/five-letter-words.json";
  private sixLetterDictionaryURL = "assets/six-letter-words.json";
  private sevenLetterDictionaryURL = "assets/seven-letter-words.json";

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
    ) { 

    this.sessionService.session.subscribe(session => {
      this.options = session.options;
    });

    this.fetchDictionary();
  }

  public generateWord(wordLength: number) {
    let words = this.getWords(wordLength);

    let randomWord = words[Math.floor(Math.random() * words.length)];

    return randomWord.toLocaleUpperCase();
  }

  private getWords(length: number): string[] {
    let words;

    if (this.options.masochistMode) {
      words = this.dictionary.filter(word => word.length === length);
    } else {
      words = this.cache.get(length);
    }

    return words ? words : [];
  }

  public hasWord(word: string): boolean {
    let curatedList: string[] = this.getWords(word.length);

    //  Check the curated list first since its smaller
    if (curatedList.includes(word.toLocaleLowerCase())) {
      return true;
    }

    //  check the full dictionary
    return this.dictionary.includes(word.toLocaleLowerCase());
  }

  private fetchDictionary(): void {
    const fullDictionary = this.http.get(this.fullDictionaryURL);
    const dictionaryOne = this.http.get(this.fiveLetterDictionaryURL);
    const dictionaryTwo = this.http.get(this.sixLetterDictionaryURL);
    const dictionaryThree = this.http.get(this.sevenLetterDictionaryURL);


    forkJoin([fullDictionary, dictionaryOne, dictionaryTwo, dictionaryThree]).subscribe(data => {
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