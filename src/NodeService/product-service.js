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