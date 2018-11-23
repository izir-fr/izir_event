var express = require('express')
var router = express.Router()

// Controllers
var newsfeedCtrl = require('../controllers/newsfeedController')

// Get all posts
router.get('/', newsfeedCtrl.getAllPosts)

// Get single post
router.get('/:id', newsfeedCtrl.getSinglePost)

module.exports = router
