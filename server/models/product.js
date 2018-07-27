var mongoose = require('mongoose');

var Product = mongoose.model('Product', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    default: null
  },
  amount: {
    type: Number,
    default: null
  }
});

module.exports = {Product};
