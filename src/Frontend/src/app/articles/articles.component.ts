import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { ARTICLES } from '../data';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles = ARTICLES;
  selectedArticle?: Article;
  newArticle?: Article;

  onSelect(article: Article): void {
    if(!this.newArticle)
      this.selectedArticle = article;
  }

  createNewArticle(): void {
    this.selectedArticle = undefined;
    this.newArticle = { id: ARTICLES.length, name: '', price: 0 };
  }

  closeNewArticle(confirm: boolean) : void {
    if (confirm && this.newArticle)
      ARTICLES.push(this.newArticle);

    this.newArticle = undefined;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
