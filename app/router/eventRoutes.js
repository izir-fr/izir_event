var express = require('express'),
	router = express.Router(),
	//passport = require('passport'),
	//LocalStrategy = require('passport-local').Strategy,
	bodyParser = require('body-parser'),
	urlencodedParser = bodyParser.urlencoded({ extended: false });

// Models
var Event = require('../models/event');
var Registration = require('../models/registration');
var User = require('../models/user');

//Controller
var eventCtrl = require('../controllers/eventController')

/*==========
START APP =>
==========*/

function ensureAuthenticated (req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/user/login');
	}
}

// Get all event
router.get('/finder', eventCtrl.getAllEvent );

// Get create event page
router.get('/create', ensureAuthenticated, eventCtrl.getCreateEvent );

// Post a create event
router.post('/create', eventCtrl.postCreateEvent );

// Get a edit event page
router.get('/edit/:id', ensureAuthenticated, eventCtrl.getEditEvent );

// Post a edit event
router.post('/edit/:id', eventCtrl.postEditEvent );

// Get a event
router.get('/:id', eventCtrl.GetSingleEvent )

module.exports = router;