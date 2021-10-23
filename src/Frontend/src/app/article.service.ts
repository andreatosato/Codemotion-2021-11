import { Injectable } from '@angular/core';
import { Observable, of, Subject, Subscriber } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Article } from './article';
import { ARTICLES } from './data';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  articles = [...ARTICLES];
  src: Subject<Article[]> = new Subject<Article[]>();

  initialize() {
    this.src.next(this.articles);
  }

  getArticles(): Observable<Article[]> {
    return this.src;
  }

  addArticle(article: Article) {
    this.articles = [...this.articles, article];
    this.src.next(this.articles);
  }

  constructor() { }
}
