import { Component, OnInit } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { Article } from '../article';
import { ArticleService } from '../article.service';
import { Availability } from '../Availability';

declare const M: any;

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  selectedArticle?: Availability;
  newArticle?: Article;
  sortingKey: string = 'id';

  sortedArticles(): Article[] {
    return this.articles.sort((a, b) => {
      switch (this.sortingKey) {
        case 'id': return a.id < b.id ? -1 : 1;
        case 'name': return a.name.localeCompare(b.name);
        case 'price': return a.price < b.price ? -1 : 1;
        default: return 0;
      }
    })
  }

  onSelect(article?: Article): void {
    this.selectedArticle = article ? new Availability(article) : undefined;
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

  closeEditArticle(confirm: boolean): void {
    if (confirm && this.selectedArticle)
      this.articleSrv.setAvailability(this.selectedArticle);

    this.selectedArticle = undefined;
  }

  constructor(private articleSrv: ArticleService) { }

  ngOnInit(): void {
    this.articleSrv.getArticles().subscribe(result => this.articles = result);
  }
}
