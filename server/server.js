require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');

var { Product } = require('./models/product');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
var v1 = express.Router();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

v1.post('/products', authenticate, (req, res) => {
  var product = new Product({
    name: req.body.name
  });

  product.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

v1.get('/products', authenticate, (req, res) => {
  Product.find().then((products) => {
    res.send({ products });
  }, (e) => {
    res.status(400).send(e);
  });
});

v1.get('/products/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findById(id).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({ product });
  }).catch((e) => {
    res.status(400).send();
  });
});

v1.delete('/products/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findByIdAndRemove(id).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({ product });
  }).catch((e) => {
    res.status(400).send();
  });
});

v1.put('/products/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'price', 'amount']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Product.findByIdAndUpdate(id, { $set: body }, { new: true }).then((product) => {
    if (!product) {
      return res.status(404).send();
    }

    res.send({ product });
  }).catch((e) => {
    res.status(400).send();
  })
});

v1.options('/*', authenticate, (req, res) => {
  res.status(200).send();
});

// Users

v1.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

v1.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['name', 'password']);
  User.findByCredentials(body.name, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-access-token', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.use('/api/v1', v1);

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };
