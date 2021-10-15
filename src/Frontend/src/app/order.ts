import { Article } from './article';
import { BasketItem } from './basketitem';

export class Order {
    id: number;
    creationDate: Date;
    items: BasketItem[];

    getPrice() {
        let total = 0;

        for(let item of this.items)
            total += item.article.price * item.amount;

        return total;
    }

    constructor() {
        this.id = 0;
        this.creationDate = new Date();
        this.items = [];
    }
}