var express = require('express')
var router = express.Router()

// Controllers
var newsfeedCtrl = require('../controllers/newsfeedController')

// Get add to cart a product
router.get('/', newsfeedCtrl.getAllPosts)

module.exports = router
