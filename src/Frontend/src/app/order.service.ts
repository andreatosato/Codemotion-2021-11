import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Order } from './order';
import { ORDERS } from './data';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  src: Subject<Order> = new Subject<Order>();

  initialize() {
    for (let order of ORDERS)
      this.src.next(order);
  }

  getOrders(): Observable<Order> {
    return this.src;
  }

  addOrder(order: Order) {
    this.src.next(order);
  }

  constructor() { }
}
