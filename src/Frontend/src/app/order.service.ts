import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { BasketItem } from './basketitem';
import { API } from './config';
import { Order } from './order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orders: Order[] = [];
  src: Subject<Order[]> = new Subject<Order[]>();

  getAllOrders() {
    const url = this.api.getOrders();

    this.http.get<any>(url).subscribe(result => {
      this.orders = result.map((o: { orderCreated: Date; products: { productId: number | undefined; quantity: number | undefined; soldPrice: number | undefined; }[]; }) => {
        let order = new Order();
        order.orderCreated = o.orderCreated;
        order.items = o.products.map((p: { productId: number | undefined; quantity: number | undefined; soldPrice: number | undefined; }) => new BasketItem(undefined, p.productId, p.quantity, p.soldPrice))
        return order;
      });

      this.src.next(this.orders);
    });
  }

  getOrders(): Observable<Order[]> {
    return this.src;
  }

  addOrder(order: Order) {
    const url = this.api.saveOrder();

    const payload = {
      products: order.items
    };

    this.http.post(url, payload).subscribe(ok => {
      this.getAllOrders();
    }, error => {
      // mostare qualcosa
    });
  }

  constructor(private http: HttpClient, private api: API) { }
}
