var express = require('express')
var router = express.Router()

// Controller
var eventCtrl = require('../controllers/eventController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

/* ==========
START APP =>
========== */

// Get single event
router.get('/:id', eventCtrl.GetSingleEvent)

// Get all event
router.get('/finder', eventCtrl.getAllEvent)

// Get create event page
router.get('/create', ensureAuthenticated, eventCtrl.getCreateEvent)

// Post a create event
router.post('/create', eventCtrl.postCreateEvent)

// Get a edit event page
router.get('/edit/:id', ensureAuthenticated, eventCtrl.getEditEvent)

// Post a edit event
router.post('/edit/:id', eventCtrl.postEditEvent)

// Get create race page
router.get('/:event/race/create', ensureAuthenticated, eventCtrl.getCreateRace)

// Post a create race
router.post('/:event/race/create', eventCtrl.postCreateRace)

// Get a edit race page
router.get('/:event/race/:race/edit/', ensureAuthenticated, eventCtrl.getEditRace)

// Post a edit race
router.post('/:event/race/:race/edit/', eventCtrl.postEditRace)

module.exports = router
