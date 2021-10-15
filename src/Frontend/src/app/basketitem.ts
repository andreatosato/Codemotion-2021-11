import { Article } from './article';

export class BasketItem {
    article: Article;
    amount: number;

    constructor(article: Article) {
        this.article = article;
        this.amount = 1;
    }
}