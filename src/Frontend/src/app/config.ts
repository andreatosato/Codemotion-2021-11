import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class API {
    baseUrl: string = "http://localhost:10000/";

    getProducts(): string { return `${this.baseUrl}a/ProductAvailability`; }
    saveProduct(): string { return `${this.baseUrl}p/product`; }

    getOrders(): string { return `${this.baseUrl}o/orders`; }
    getOrder(id: string): string { return `${this.baseUrl}o/orders/${id}`; }
    saveOrder(): string { return `${this.baseUrl}a/order`; }

    getStores(): string { return `${this.baseUrl}s/store/`; }
    getStore(id: string): string { return `${this.baseUrl}s/store/${id}/`; }
    saveStore(): string { return `${this.baseUrl}s/store/`; }
}