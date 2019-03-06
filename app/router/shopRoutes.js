var express = require('express')
var router = express.Router()

// Controllers
var cartCtrl = require('../controllers/cartController')

// Get add to cart a product
router.get('/', cartCtrl.getAllProduct)

// Get cart
router.get('/produit/:id', cartCtrl.getProductById)

module.exports = router
