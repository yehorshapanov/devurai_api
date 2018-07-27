const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Product } = require('./../models/product');

const products =
  [
    {
      _id: new ObjectID(),
      name: 'First test product'
    }, 
    {
      _id: new ObjectID(),
      name: 'Second test product',
      price: 10,
      amount: 333
    }
  ];

beforeEach((done) => {
  Product.remove({}).then(() => {
    return Product.insertMany(products);
  }).then(() => done());
});

describe('POST /products', () => {
  it('should create a new product', (done) => {
    var name = 'Test product name';

    request(app)
      .post('/products')
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
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/products/123abc')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /products/:id', () => {
  it('should remove a product', (done) => {
    var hexId = products[1]._id.toHexString();

    request(app)
      .delete(`/products/${hexId}`)
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
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/products/123abc')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeFalsy();
      })
      .end(done);
  });
});
