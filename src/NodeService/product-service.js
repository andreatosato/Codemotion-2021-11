'use strict';

// eslint-disable-next-line
require('./tracer')('example-express-server');

// Require in rest of modules
const express = require('express');
const cors = require('cors');
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
app.use(cors());

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