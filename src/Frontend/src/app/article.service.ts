import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, Subscriber } from 'rxjs';
import { Article } from './article';
import { API } from './config';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  articles: Article[] = [];
  src: Subject<Article[]> = new Subject<Article[]>();

  initialize() {
    const url = this.api.getProducts();

    this.http.get<Article[]>(url).subscribe(result => {
      this.articles = result;
      this.src.next(this.articles);
    });
  }

  getArticles(): Observable<Article[]> {
    return this.src;
  }

  addArticle(article: Article) {
    const url = this.api.saveProduct();
    this.http.post(url, article).subscribe(ok => {
      this.articles = [...this.articles, article];
      this.src.next(this.articles);
    }, error => {
      // mostare qualcosa
    })
  }

  constructor(private http: HttpClient, private api: API) { }
}
