* installazione angular CLI: 
```
npm install -g @angular/cli
```

* creazione del progetto: 
```
ng new frontend
```

* verifica del funzionamento della pagina
```
cd frontend
ng serve --open
```

* creazione componente articoli
```
ng generate component articles
```

* installazione materialize CSS in `index.html`
```html
<!-- materialize -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

* definizione classe Article in `article.ts`
* definizione dati di esempio in `data.ts`
* implementazione griglia e form di edit/inserimento dati nel componente articles
* creazione componente ordini
```
ng generate component orders
```

* modifica di `app.component.ts` per eseguire l'inizializzazione dei componenti JS di materialize CSS una volta che i componenti sono stati caricati
```js
declare const M: any;
...
ngAfterViewInit() {
    M.AutoInit();
}
``` 

* creazione dei servizi `article.service.ts` e `order.service.ts`, integrazione con i componenti