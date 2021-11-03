import { Article } from "./article";

export class Availability {
    productId: number;
    name: string;
    availability: number;

    constructor(article: Article) {
        this.productId = article.id;
        this.name = article.name;
        this.availability = article.availability;
    }
}