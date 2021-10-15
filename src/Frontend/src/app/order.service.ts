import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Order } from './order';
import { ORDERS } from './data';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  getOrders(): Observable<Order[]> {
    const orders = of(ORDERS);
    return orders;
  }

  addOrder(order: Order) {
    ORDERS.push(order);
  }

  constructor() { }
}
