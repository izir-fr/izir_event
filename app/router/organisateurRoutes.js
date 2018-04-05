var express = require('express'),
	router = express.Router();

// Models
var	Event = require('../models/event'),
	Registration = require('../models/registration'),
	User = require('../models/user');

// Controllers
var organisateurCtrl = require('../controllers/organisateurController');

var ensureAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/user/login');
	}
}

// Get all épreuves
router.get('/epreuves',ensureAuthenticated, organisateurCtrl.getEpreuves );

// Get contact form
router.get('/contacter/:id', ensureAuthenticated, organisateurCtrl.getContacter )

// Post contact form
router.post('/contacter/:id', organisateurCtrl.postContacter )

// Get comptabilité
router.get('/comptabilite/:id', ensureAuthenticated, organisateurCtrl.getComptabilite )

//Post comptabilité
router.post('/comptabilite/:id', organisateurCtrl.postComptabilite )

module.exports = router;