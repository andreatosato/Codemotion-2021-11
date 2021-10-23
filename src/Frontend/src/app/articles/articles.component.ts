import { Component, OnInit } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { Article } from '../article';
import { ArticleService } from '../article.service';

declare const M: any;

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  selectedArticle?: Article;
  newArticle?: Article;

  onSelect(article?: Article): void {
    this.selectedArticle = article;
  }

  createNewArticle(): void {
    this.selectedArticle = undefined;
    this.newArticle = new Article();
  }

  isNewArticleValid(): boolean {
    var isValid = true;
    document.querySelectorAll("input.validate").forEach(el => isValid = isValid && el.classList.contains("valid"));
    return isValid;
  }

  closeNewArticle(confirm: boolean): void {
    if (confirm && this.newArticle)
      this.articleSrv.addArticle(this.newArticle);

    this.newArticle = undefined;
  }

  constructor(private articleSrv: ArticleService) { }

  ngOnInit(): void {
    this.articleSrv.getArticles().subscribe(result => this.articles = result);
  }
}
