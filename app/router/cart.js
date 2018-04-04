var express = require('express'),
	router = express.Router();

var Product = require('../models/product'),
	Cart = require('../models/cart')

router.get('/', (req, res)=>{
	Product.find({published: {$ne: false}})
		.exec(function(err, products){
			res.render('partials/shop/catalogue', {products: products})
		})
})

router.get('/add/:id',(req, res)=>{
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {items: {}})

	Product.findById(productId,(err, product)=>{
		if (err){
			return res.redirect('/')
		}
		cart.add(product, product.id)
		req.session.cart = cart
		console.log(req.session.cart)
		res.redirect('/catalogue/')
	})
})

router.get('/reduce-by-one/:id', (req, res)=>{
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.reduceByOne( productId )
	req.session.cart = cart
	res.redirect('/catalogue/panier')
})

router.get('/increase-by-one/:id', (req, res)=>{
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.increaseByOne( productId )
	req.session.cart = cart
	res.redirect('/catalogue/panier')
})

router.get('/reduce-by-x/:id', (req, res)=>{
	var productId = req.params.id
	var qtyX = req.query.remove * 1
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.reduceByX( productId , qtyX )
	req.session.cart = cart
	res.redirect('/catalogue/panier')
})

router.get('/increase-by-x/:id', (req, res)=>{
	var productId = req.params.id
	var qtyX = req.query.add * 1
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.increaseByX( productId , qtyX )
	req.session.cart = cart
	res.redirect('/catalogue/panier')
})

router.get('/remove/:id', (req, res)=>{
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.removeItem(productId)
	req.session.cart = cart
	res.redirect('/catalogue/panier')
})

router.get('/produit/:id',(req,res)=>{
	Product.findById(req.params.id,(err, produit)=>{
		var produit = produit
		if(produit.published) {
			res.render('partials/shop/produit', {product : produit})			
		} else {
			res.redirect('/catalogue/')
		}

	})
})

router.get('/panier',(req, res)=>{
	if(!req.session.cart){
		return res.render('partials/shop/panier', {products: null})
	}
	var cart = new Cart(req.session.cart)
	res.render('partials/shop/panier', {products: cart.generateArray(), totalPrice: cart.totalPrice})
})

module.exports = router;