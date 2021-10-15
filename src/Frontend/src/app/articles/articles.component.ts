import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { ArticleService } from '../article.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  selectedArticle?: Article;
  newArticle?: Article;

  onSelect(article: Article): void {
    if(!this.newArticle)
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

  closeNewArticle(confirm: boolean) : void {
    if (confirm && this.newArticle)
      this.articleSrv.addArticle(this.newArticle);

    this.newArticle = undefined;
  }

  constructor(private articleSrv : ArticleService) { }

  ngOnInit(): void {
    this.articleSrv.getArticles().subscribe(result => this.articles = result);
  }

}
