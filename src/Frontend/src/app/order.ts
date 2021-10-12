import { Article } from './article';

export class Order {
    id: number;
    creationDate: Date;
    articles: Article[];

    getPrice() {
        let total = 0;

        for(let article of this.articles)
            total += article.price;

        return total;
    }

    constructor() {
        this.id = 0;
        this.creationDate = new Date();
        this.articles = [];
    }
}