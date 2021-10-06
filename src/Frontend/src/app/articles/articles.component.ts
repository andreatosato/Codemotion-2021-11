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

  onSelect(article: Article): void {
    this.selectedArticle = article;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
