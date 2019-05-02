var mongoose = require('mongoose')
var Promise = require('bluebird')

// Event Schema
var productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  categorie: { type: String, required: true },
  ref: { type: String, required: true },
  brand: { type: String, required: true },
  images: [ { url: { type: String, required: true } } ],
  buy_price: { type: Number },
  public_price: { type: Number, required: true },
  promo_price: { type: Number },
  inventory: { type: Number },
  created_at: { type: Date, default: Date.now }, // required: true,
  updated: { type: Date },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false }
})

var Product = module.exports = mongoose.model('Product', productSchema)

module.exports.productSuggestion = new Promise((resolve, reject) => {
  Product
    .find({ featured: true, published: true })
    .limit(1)
    .exec((err, product) => {
      if (err) {
        reject(err)
      }
      resolve(product[0])
    })
})
