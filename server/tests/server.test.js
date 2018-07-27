const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Product } = require('./../models/product');
const { User } = require('./../models/user');

const { products, populateProducts, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateProducts);
describe('POST /products', () => {
  it('should create a new product', (done) => {
    var name = 'Test product name';

    request(app)
      .post('/products')
      .set('x-access-token', users[0].tokens[0].token)
      .send({ name })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Product.find({ name }).then((products) => {
          expect(products.length).toBe(1);
          expect(products[0].name).toBe(name);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create product with invalid body data', (done) => {
    request(app)
      .post('/products')
      .set('x-access-token', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Product.find().then((products) => {
          expect(products.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /products', () => {
  it('should get all products', (done) => {
    request(app)
      .get('/products')
      .set('x-access-token', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.products.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /products/:id', () => {
  it('should return product name', (done) => {
    request(app)
      .get(`/products/${products[0]._id.toHexString()}`)
      .set('x-access-token', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.product.name).toBe(products[0].name);
      })
      .end(done);
  });

  it('should return 404 if product not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/products/123abc')
      .set('x-access-token', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /products/:id', () => {
  it('should remove a product', (done) => {
    var hexId = products[1]._id.toHexString();

    request(app)
      .delete(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.product._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Product.findById(hexId).then((product) => {
          expect(product).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if product not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/products/sdfsdw')
      .set('x-access-token', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PUT /products/:id', () => {
  it('should update the product name', (done) => {
    var hexId = products[0]._id.toHexString();
    var name = 'This should be the new name';

    request(app)
      .put(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .send({
        name
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.product.name).toBe(name);
        expect(res.body.product.price).toBe(null);
        expect(res.body.product.amount).toBe(null);
      })
      .end(done);
  });

  it('should update the product price', (done) => {
    var hexId = products[0]._id.toHexString();
    var price = 42;

    request(app)
      .put(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .send({
        price
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.product.price).toBe(42);
        expect(res.body.product.amount).toBe(null);
      })
      .end(done);
  });

  it('should update the product name', (done) => {
    var hexId = products[0]._id.toHexString();
    var amount = 123;

    request(app)
      .put(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .send({
        amount
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.product.amount).toBe(123);
      })
      .end(done);
  });
});

describe('OPTIONS /*', () => {
  it('should return status 200 and empty body', (done) => {
    var hexId = products[0]._id.toHexString();
    request(app)
      .options(`/products/${hexId}`)
      .set('x-access-token', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeFalsy();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-access-token', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-access-token']).not.toBeNull();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-access-token']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-access-token']).toBeUndefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
