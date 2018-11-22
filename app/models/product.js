var mongoose = require('mongoose')

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

module.exports = mongoose.model('Product', productSchema)
