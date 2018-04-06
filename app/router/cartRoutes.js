var express = require('express'),
	router = express.Router();

// Models
var Product = require('../models/product'),
	Cart = require('../models/cart')

// Controllers
var cartCtrl = require('../controllers/cartController')

// Get add to cart a product
router.get('/', cartCtrl.getAddToCart )

// Get reduce product cart quantity by one
router.get('/add/:id', cartCtrl.getReduceByOne )

// Get increase product cart quantity by one
router.get('/reduce-by-one/:id', cartCtrl.getIncreaseByOne )

// Get reduce product cart quantity by X
router.get('/increase-by-one/:id',  cartCtrl.getReduceByX )

// Get increase product cart quantity by X
router.get('/reduce-by-x/:id', cartCtrl.getIncreaseByX )

// Get remove a product in cart
router.get('/increase-by-x/:id', cartCtrl.getRemoveProductCart )

// Get a product
router.get('/remove/:id', cartCtrl.getProduct )

// Get cart
router.get('/produit/:id', cartCtrl.getCart )

// Get all product
router.get('/panier', cartCtrl.getAllProduct )

module.exports = router;