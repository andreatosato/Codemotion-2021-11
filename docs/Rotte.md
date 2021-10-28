# Aggregator

Crea un nuovo ordine, verifica disponibilità a magazzino, aggiorna disponibilità
[POST] http://localhost:10000/a/Order
Ritorna la disponibilità dei prodotti nel magazzino
```JSON
{
  "products": [
    {
      "id": 1,
      "quantity": 1,
      "soldPrice": 3.99
    }
  ]
}
```

[GET] http://localhost:10000/a/ProductAvailability

Crea dei prodotti e disponibilità di test
[POST] http://localhost:10000/a/ProductAvailability/FakeData 


# Ordini
Ritorna tutti gli ordini
[GET] http://localhost:10000/o/Order
Ritorna un solo ordine
[GET] http://localhost:10000/o/Order/{id}
Crea un ordine
[POST] http://localhost:10000/o/Order/

# Store
Ritorna tutti i prodotti
[GET] http://localhost:10000/s/Store
Ritorna una sola disponibilità prodotto
[GET] http://localhost:10000/s/Store/{id}
Crea una disponibilità per un prodotto o l'aggiorna
[POST] http://localhost:10000/s/Store/
```JSON
{
    "productId":"1234",
    "availability":50
}
```

# Product
http://localhost:10000/p/product va su products
Ritorna tutti i prodotti
[GET] http://localhost:10000/p/product
Ritorna un solo prodotto
[GET] http://localhost:10000/p/product/{id}
Crea un prodotto
[POST] http://localhost:10000/p/product
```JSON
{
    "id": 2,
    "name": "Fragole",
    "description": "Fragole italiane",
    "price": 1.56,
    "country": "Italia"
}
```
