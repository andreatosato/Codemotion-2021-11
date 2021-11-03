import { Article } from './article';
import { BasketItem } from './basketitem';

export class Order {
    id: number;
    orderCreated: Date;
    items: BasketItem[];

    getItemsCount() {
        let total: number = 0;

        for (let item of this.items)
            total += item.quantity * 1;

        return total;
    }

    getPrice() {
        let total = 0;

        for (let item of this.items)
            total += item.soldPrice * item.quantity;

        return total;
    }

    constructor() {
        this.id = 0;
        this.orderCreated = new Date();
        this.items = [];
    }
}