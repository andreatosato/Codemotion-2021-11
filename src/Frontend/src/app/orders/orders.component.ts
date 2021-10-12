import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { Order } from '../order';
import { ARTICLES, ORDERS } from '../data';
import { BasketItem } from '../basketitem';

declare const M: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  articles = ARTICLES;
  orders = ORDERS;
  selectedOrder?: Order;
  newOrder?: Order;
  selectedArticle? : number;

  onSelect(order: Order): void {
    if (!this.newOrder)
      this.selectedOrder = order;
  }

  createNewOrder(): void {
    this.selectedOrder = undefined;
    this.newOrder = new Order();
  }

  closeNewOrder(confirm: boolean): void {
    if (confirm && this.newOrder)
      ORDERS.push(this.newOrder);

    this.newOrder = undefined;
  }

  addArticle(): void {
    if(this.selectedArticle && this.newOrder)
    {
      let articleId = Number(this.selectedArticle);
      let item = this.newOrder.items.find(i => i.article.id === articleId);

      if(item)
        item.amount++;
      else
      {
        let article = this.articles.find(a => a.id === articleId);

        if(article)
          this.newOrder.items.push(new BasketItem(article));
      }
    }
    this.selectedArticle = undefined;
  }

  removeArticle(id: number): void {
    if(this.newOrder)
    {
      let index = this.newOrder.items.findIndex(i => i.article.id === id);
      if(index > -1)
        this.newOrder.items.splice(index, 1);
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    var selects = document.querySelectorAll('select.materialize');
    if(selects.length)
      M.FormSelect.init(selects, {});
  }
}
