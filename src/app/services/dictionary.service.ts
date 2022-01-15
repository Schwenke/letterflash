import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  public dictionary: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  cache: Map<number, string[]> = new Map<number, string[]>();

  private jsonURL = "assets/dictionary.json";

  constructor(private http: HttpClient) { 
    this.fetchDictionary();
  }

  public generateWord(wordLength: number) {
    let words = this.getWords(wordLength);

    let randomWord = words[Math.floor(Math.random() * words.length)];

    return randomWord.toLocaleUpperCase();
  }

  private getWords(wordLength: number): string[] {
    if (this.cache.has(wordLength)) {
      let cachedWords = this.cache.get(wordLength);

      return cachedWords ? cachedWords : [];
    }

    let dictionary = this.dictionary.value;

    let words = dictionary.filter(word => word.length === wordLength);

    this.cache.set(wordLength, words);

    return words;
  }

  public hasWord(word: string): boolean {
    let wordLength: number = word.length;
    let cachedWords = this.cache.get(wordLength);

    if (cachedWords) {
      return cachedWords.includes(word.toLocaleLowerCase());
    } else {
      return false;
    }
  }

  private fetchDictionary(): void {
    this.http.get(this.jsonURL).subscribe((response: any) => { 
      let dictionary = response;

      this.dictionary.next(dictionary);
    });
  }

}