var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Event Schema
var orderSchema = mongoose.Schema({
	name: { type : String, required: true },
	description : { type : String, required: true },
	categorie: { type : String, required: true },
	ref: { type : String, required: true },
	brand: { type : String, required: true },
	images: [ { url : { type : String, required: true } } ],
	buy_price: { type: Number},
	public_price: { type: Number, required: true },
	price: { type: Number },
	inventory: { type: Number, required: true },
	created_at : { type: Date, default: Date.now },//required: true, 
	updated: { type: Date },
	published: { type: Boolean, default: false}
});

var Product = module.exports = mongoose.model('Product', orderSchema);