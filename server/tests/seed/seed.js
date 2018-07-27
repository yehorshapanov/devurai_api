const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Product } = require('./../../models/product');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    name: 'admin',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
    }]
  },
  // Second user for tests
  {
    _id: userTwoId,
    name: 'nobody',
    password: 'userTwoPass'
  }
];

const products = [
  {
    _id: new ObjectID(),
    name: 'First test product'
  }, {
    _id: new ObjectID(),
    name: 'Second test product',
    price: 42,
    amount: 100
  }
];

const populateProducts = (done) => {
  Product.remove({}).then(() => {
    return Product.insertMany(products);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = { products, populateProducts, users, populateUsers };
