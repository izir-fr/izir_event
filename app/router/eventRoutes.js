var express = require('express')
var router = express.Router()

// Controller
var eventCtrl = require('../controllers/eventController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

/* ==========
START APP =>
========== */

// Get all event
router.get('/finder', eventCtrl.getAllEvent)

// Get newsfeed
router.get('/newsfeed', eventCtrl.getNewsfeed)

// Get create event page
router.get('/create', ensureAuthenticated, eventCtrl.getCreateEvent)

// Post a create event
router.post('/create', eventCtrl.postCreateEvent)

// Get a edit event page
router.get('/edit/:id', ensureAuthenticated, eventCtrl.getEditEvent)

// Post a edit event
router.post('/edit/:id', eventCtrl.postEditEvent)

// Get a event
router.get('/:id', eventCtrl.GetSingleEvent)

module.exports = router
