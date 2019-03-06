var express = require('express')
var router = express.Router()

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Controllers
var cartCtrl = require('../controllers/cartController')

// Get all product
router.get('/', cartCtrl.getCart)

// add races and options to cart
router.post('/add/registration', cartCtrl.postAddRegistration)

// Get reduce product cart quantity by one
router.get('/add/:product', ensureAuthenticated, cartCtrl.getAddToCart)

// Change product quantity in cart
router.post('/change-quantity/:product', ensureAuthenticated, cartCtrl.postChangeQty)

// Remove au product
router.get('/remove/:product', ensureAuthenticated, cartCtrl.getRemoveProductCart)

// Checkout with credit card
router.get('/checkout/credit', ensureAuthenticated, cartCtrl.getPaiementCredit)

router.post('/checkout/credit/:cart', ensureAuthenticated, cartCtrl.postPaiementCredit)

// Checkout with stripe
router.get('/checkout/check', ensureAuthenticated, cartCtrl.getPaiementCheck)

module.exports = router
