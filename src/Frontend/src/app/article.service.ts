import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Article } from './article';
import { ARTICLES } from './data';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  getArticles(): Observable<Article[]> {
    const articles = of(ARTICLES);
    return articles;
  }

  addArticle(article: Article) {
    ARTICLES.push(article);
  }
  
  constructor() { }
}
