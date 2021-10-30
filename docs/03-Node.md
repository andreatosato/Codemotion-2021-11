
Collection di prova:

https://www.getpostman.com/collections/a6ab652921065f8ec034

```
npm i @opentelemetry/api @opentelemetry/exporter-jaeger @opentelemetry/exporter-zipkin
npm i @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http opentelemetry-instrumentation-mongoose
npm i @opentelemetry/resources @opentelemetry/sdk-trace-base @opentelemetry/sdk-trace-node @opentelemetry/semantic-conventions
npm i axios cross-env express mongoose
```

## Tracer
```JS
'use strict';

const opentelemetry = require('@opentelemetry/api');

// Not functionally required but gives some insight what happens behind the scenes
const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { AlwaysOnSampler } = require('@opentelemetry/core');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { MongooseInstrumentation } = require('opentelemetry-instrumentation-mongoose');
const { Resource } = require('@opentelemetry/resources');
const { SemanticAttributes, SemanticResourceAttributes: ResourceAttributesSC } = require('@opentelemetry/semantic-conventions');

const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

module.exports = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ResourceAttributesSC.SERVICE_NAME]: serviceName,
    }),
    sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      MongooseInstrumentation,
      HttpInstrumentation,
      ExpressInstrumentation,
    ],
  });

  const zipkin = new ZipkinExporter({url: 'http://zipkin:9411/api/v2/spans', serviceName: serviceName});
  const jaeger = new JaegerExporter({url: 'http://jaeger:14268/api/traces', serviceName: serviceName});
  const exporter = (process.env.EXPORTER || '').toLowerCase().startsWith('z') ? zipkin : jaeger;

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer('express-example');
};

function filterSampler(filterFn, parent) {
  return {
    shouldSample(ctx, tid, spanName, spanKind, attr, links) {
      if (!filterFn(spanName, spanKind, attr)) {
        return { decision: opentelemetry.SamplingDecision.NOT_RECORD };
      }
      return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
    },
    toString() {
      return `FilterSampler(${parent.toString()})`;
    }
  }
}

function ignoreHealthCheck(spanName, spanKind, attributes) {
  return spanKind !== opentelemetry.SpanKind.SERVER || attributes[SemanticAttributes.HTTP_ROUTE] !== "/health";
}
```

## Codice applicativo
```JS
'use strict';

// eslint-disable-next-line
require('./tracer')('example-express-server');

// Require in rest of modules
const express = require('express');
const axios = require('axios').default;
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  _id: {type: Number, required: true},
  name: String,
  description: String,
  price: Number,
  country: String
});

const productDbSet = mongoose.model('Product', productSchema);

// Setup express
const app = express();
const PORT = 5000;

const getCrudController = () => {
  const router = express.Router();
  const resources = [];
  router.get('/', async (req, res) => {
    const products = await productDbSet.find();
    let result = [];
    for (let index = 0; index < products.length; index++) {
      result.push({
        id: products[index]._id,
        name: products[index].name,
        description: products[index].description,
        price: products[index].price,
        country: products[index].country
      });
    }
    res.send(result);
  });
  router.get('/:productId', async (req, res) => {
    const oldProduct = await productDbSet.findById(req.params.productId).exec();
    res.send({
      id: oldProduct._id,
      name: oldProduct.name,
      description: oldProduct.description,
      price: oldProduct.price,
      country: oldProduct.country
    });
  });
  router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body));
    const newProduct = req.body;

    if(newProduct.id <= 0)
      return res.status(400).send(req.body);

    const old = await productDbSet.findById(newProduct.id).exec();
    if(old === null) {
      const productNew = new productDbSet({
        _id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        country: newProduct.country
      });
      await productNew.save();

      newProduct.id = productNew._id;
      return res.status(201).send(newProduct);
    }
    else
      return res.status(409).send(old);
  });
  return router;
};

app.use(express.json());
app.use('/product', getCrudController());

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

main().catch(err => console.log(err));

async function main() {
  mongoose.connect('mongodb://mongodb:27017/productdb', {
    auth: { username: "root", password: "example" },
    authSource: "admin",
  })
    .catch(error => {
      console.log(error);
    });

  productDbSet.createCollection();
}
```

## DockerFile
```
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 5000

CMD npm run zipkin:server
```