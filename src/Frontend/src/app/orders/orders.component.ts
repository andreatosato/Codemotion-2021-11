import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { Order } from '../order';
import { BasketItem } from '../basketitem';
import { ArticleService } from '../article.service';
import { OrderService } from '../order.service';

declare const M: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  articles: Article[] = [];
  orders: Order[] = [];
  selectedOrder?: Order;
  newOrder?: Order;
  selectedArticle?: number;

  onSelect(order?: Order): void {
    this.selectedOrder = order;
  }

  createNewOrder(): void {
    this.selectedOrder = undefined;
    this.newOrder = new Order();
    this.newOrder.id = this.orders.length + 1;
    this.selectedArticle = undefined;
  }

  closeNewOrder(confirm: boolean): void {
    if (confirm && this.newOrder)
      this.orderSrv.addOrder(this.newOrder);

    this.newOrder = undefined;
  }

  getArticleName(id: number): string | undefined {
    return this.articles.find(a => a.id === id)?.name;
  }

  addArticle(): void {
    if (this.selectedArticle && this.newOrder) {
      let articleId = Number(this.selectedArticle);
      let item = this.newOrder.items.find(i => i.productId === articleId);

      if (item)
        item.quantity++;
      else {
        let article = this.articles.find(a => a.id === articleId);

        if (article)
          this.newOrder.items.push(new BasketItem(article));
      }
    }
  }

  removeArticle(id: number): void {
    if (this.newOrder) {
      let index = this.newOrder.items.findIndex(i => i.productId === id);
      if (index > -1)
        this.newOrder.items.splice(index, 1);
    }
  }

  constructor(private articleSrv: ArticleService, private orderSrv: OrderService) { }

  ngOnInit(): void {
    this.articleSrv.getArticles().subscribe(result => this.articles = result);
    this.orderSrv.getOrders().subscribe(result => this.orders = result);
  }

  ngDoCheck(): void {
    var selects = document.querySelectorAll('select.materialize');
    if (selects.length)
      M.FormSelect.init(selects, {});
  }
}
