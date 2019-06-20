var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Promise = require('bluebird')

var Registration = require('./registration')

// Notification Schema
var cartSchema = mongoose.Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  products: [
    {
      ref: { type: String },
      qty: { type: Number },
      event: { type: Schema.ObjectId, ref: 'Event' },
      name: { type: String },
      price: { type: Number },
      subtotal: { type: Number },
      option: { type: Boolean },
      race: { type: Boolean },
      team: { type: Boolean, default: false },
      paiement_cb_required: { type: Boolean }
    }
  ],
  total_price: { type: Number },
  paiement: {
    amount: { type: Number },
    stripe_id: { type: String },
    object: { type: String },
    date: { type: Date },
    cb: { type: Boolean, default: false },
    check: { type: Boolean, default: false },
    captured: { type: Boolean, default: false }
  },
  registrations_created: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Cart', cartSchema)

module.exports.updateProduct = function Product (item) {
  this.init = item

  this.displayProduct = this.init

  this.newQuantity = (quantity) => {
    var eventId = this.init.event._id
    var eventRacersLimit = this.init.event.racers_limit
    var maxQuantityAutorized

    return new Promise((resolve, reject) => {
      Registration
        .find({event: eventId})
        .exec((err, registrations) => {
          if (err) {
            reject(err) // 'error_msg',
          }
          var registrationEstimation = registrations.length + Number(quantity)
          if (registrationEstimation >= eventRacersLimit) {
            // set product quantity
            maxQuantityAutorized = eventRacersLimit - registrations.length
          } else {
            maxQuantityAutorized = Number(quantity)
          }
          if (maxQuantityAutorized < 0) {
            maxQuantityAutorized = 0
          }
          this.displayProduct.qty = maxQuantityAutorized
          resolve(this.displayProduct)
        })
    })
  }
}
// module.exports = function Cart (oldCart) {
//   this.items = oldCart.items || {}
//   this.totalQty = oldCart.totalQty || 0
//   this.totalPrice = oldCart.totalPrice || 0

//   this.add = (item, id) => {
//     var storedItem = this.items[id]
//     if (!storedItem) {
//       storedItem = this.items[id] = {item: item, qty: 0, price: 0}
//     }
//     storedItem.qty++
//     storedItem.price = storedItem.item.price * storedItem.qty
//     this.totalQty++
//     this.totalPrice += storedItem.item.price
//   }

//   this.reduceByOne = (id) => {
//     this.items[id].qty--
//     this.items[id].price -= this.items[id].item.price
//     this.totalQty--
//     this.totalPrice -= this.items[id].item.price

//     if (this.items[id].qty <= 0) {
//       delete this.items[id]
//     }
//   }

//   this.increaseByOne = (id) => {
//     this.items[id].qty++
//     this.items[id].price += this.items[id].item.price
//     this.totalQty++
//     this.totalPrice += this.items[id].item.price

//     if (this.items[id].qty <= 0) {
//       delete this.items[id]
//     }
//   }

//   this.reduceByX = (id, qtyX) => {
//     if (qtyX >= this.items[id].qty) {
//       var qty = this.items[id].qty
//       this.items[id].qty -= qty
//       this.items[id].price -= this.items[id].item.price * qty
//       this.totalQty -= qty
//       this.totalPrice -= this.items[id].item.price * qty
//     } else {
//       this.items[id].qty -= qtyX
//       this.items[id].price -= this.items[id].item.price * qtyX
//       this.totalQty -= qtyX
//       this.totalPrice -= this.items[id].item.price * qtyX
//     }

//     if (this.items[id].qty <= 0) {
//       delete this.items[id]
//     }
//   }

//   this.increaseByX = (id, qtyX) => {
//     this.items[id].qty += qtyX
//     this.items[id].price += this.items[id].item.price * qtyX
//     this.totalQty += qtyX
//     this.totalPrice += this.items[id].item.price * qtyX
//   }

//   this.removeItem = (id) => {
//     this.totalQty -= this.items[id].qty
//     this.totalPrice -= this.items[id].price
//     delete this.items[id]
//   }

//   this.generateArray = () => {
//     var arr = []
//     for (var id in this.items) {
//       arr.push(this.items[id])
//     }
//     return arr
//   }
// }
