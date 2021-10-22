import { Injectable } from '@angular/core';
import { Observable, of, Subject, Subscriber } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Article } from './article';
import { ARTICLES } from './data';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  src: Subject<Article> = new Subject<Article>();

  initialize() {
    for (let article of ARTICLES)
      this.src.next(article);
  }

  getArticles(): Observable<Article> {
    return this.src;
  }

  addArticle(article: Article) {
    this.src.next(article);
  }

  constructor() { }
}
