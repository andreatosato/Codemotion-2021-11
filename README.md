# Codemotion-2021-11



# Node Service
1- Install Express for API
```js
npm init
npm i express --save
npm i axios
npm i cross-env
npm i mongoose --save
```
2- Scrivi il servizio per leggere dei dati in memory.

```js
'use strict';

// eslint-disable-next-line
require('./tracer')('example-express-server');

// Require in rest of modules
const express = require('express');
const axios = require('axios').default;

// Setup express
const app = express();
const PORT = 3000;

const getCrudController = () => {
  const router = express.Router();
  const resources = [];
  router.get('/', (req, res) => 
    res.send(resources)
  );
  router.post('/', (req, res) => {
    resources.push(req.body);
    return res.status(201).send(req.body);
  });
  return router;
};

app.use(express.json());
app.use('/product', getCrudController());

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
```

3- Aggiungi OpenTelemetry
```
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express @opentelemetry/sdk-trace-node @opentelemetry/sdk-trace-base @opentelemetry/exporter-jaeger @opentelemetry/exporter-zipkin @opentelemetry/resources @opentelemetry/semantic-conventions
```

4- Connect to DB
```
docker run -p 27017:27017 --env MONGO_INITDB_ROOT_USERNAME=root --env MONGO_INITDB_ROOT_PASSWORD=example --name mongodb -d mongo:latest

mongodb://root:example@mongodb:27017/productdb
```