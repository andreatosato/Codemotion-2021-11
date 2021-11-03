import { Article } from './article';

export class BasketItem {
    productId: number;
    quantity: number;
    soldPrice: number;

    constructor(article?: Article, productId?: number, quantity?: number, soldPrice?: number) {
        if (article) {
            this.productId = article.id;
            this.quantity = 1;
            this.soldPrice = article.price
        }
        else if (productId && quantity && soldPrice) {
            this.productId = productId;
            this.quantity = quantity;
            this.soldPrice = soldPrice;
        }
        else
            throw ("Invalid parameters");
    }
}