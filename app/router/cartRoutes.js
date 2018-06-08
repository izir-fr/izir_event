var express = require('express')
var router = express.Router()

// Controllers
var cartCtrl = require('../controllers/cartController')

// Get add to cart a product
router.get('/', cartCtrl.getAllProduct)

// Get reduce product cart quantity by one
router.get('/add/:id', cartCtrl.getAddToCart)

// Get increase product cart quantity by one
router.get('/reduce-by-one/:id', cartCtrl.getReduceByOne)

// Get reduce product cart quantity by X
router.get('/increase-by-one/:id', cartCtrl.getIncreaseByOne)

// Get increase product cart quantity by X
router.get('/reduce-by-x/:id', cartCtrl.getReduceByX)

// Get remove a product in cart
router.get('/increase-by-x/:id', cartCtrl.getIncreaseByX)

// Get a product
router.get('/remove/:id', cartCtrl.getRemoveProductCart)

// Get cart
router.get('/produit/:id', cartCtrl.getProductById)

// Get all product
router.get('/panier', cartCtrl.getCart)

module.exports = router
