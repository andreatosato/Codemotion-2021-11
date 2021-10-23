export class Article {
    id: number;
    name: string;
    description: string;
    price: number;
    country: string;

    constructor()
    {
        this.id = 0;
        this.name= "";
        this.description = "";
        this.price = 0;
        this.country = "";
    }
}