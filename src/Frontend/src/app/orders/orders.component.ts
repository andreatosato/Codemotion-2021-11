import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { Order } from '../order';
import { ARTICLES, ORDERS } from '../data';

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

  constructor() { }

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    var elems = document.querySelectorAll('select');
    if(elems.length)
      M.FormSelect.init(elems, {});
  }
}
