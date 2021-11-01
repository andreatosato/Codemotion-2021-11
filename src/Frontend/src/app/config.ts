import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class API {
    baseUrl: string = "http://127.0.0.1:10000/";

    getProducts(): string { return this.baseUrl + "p/product"; }
    saveProduct(): string { return this.baseUrl + "p/product"; }
}