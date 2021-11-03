export class Article {
    id: number;
    name: string;
    description: string;
    availability: number;
    price: number;
    country: string;

    constructor() {
        this.id = 0;
        this.name = "";
        this.description = "";
        this.availability = 0;
        this.price = 0;
        this.country = "";
    }
}