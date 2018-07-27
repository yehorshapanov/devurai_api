const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Product} = require('./models/product');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/products', (req, res) => {
  var product = new Product({
    name: req.body.name
  });

  product.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/products', (req, res) => {
  Product.find().then((products) => {
    res.send({products});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/products/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findById(id).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({product});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/products/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findByIdAndRemove(id).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({product});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.put('/products/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'price', 'amount']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findByIdAndUpdate(id, {$set: body}, {new: true}).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({product});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.options('/*', (req, res) => {
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
