var bodyParser = require('body-parser'),
	express = require('express'),
	router = express.Router(),
	urlencodedParser = bodyParser.urlencoded({ extended: false });

// Models
var	Event = require('../models/event'),
	Registration = require('../models/registration'),
	User = require('../models/user');

var registrationCtrl = require('../controllers/registrationController')

var ensureAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/user/login');
	}
}

// Get a pre-inscription form
router.get('/recap/user/:id', ensureAuthenticated, registrationCtrl.getPreinscription );

// Post a pre-inscription
router.get('/recap/organisateur/:id', ensureAuthenticated, registrationCtrl.postPreinscription )

// Get checkout form
router.get('/file/excel/:id', ensureAuthenticated, registrationCtrl.getCheckout )

// Post a checkout
router.get('/file/gmcap/:id', ensureAuthenticated, registrationCtrl.postCheckout )

// Get user all inscription recap
router.get('/pre-inscription/:id', ensureAuthenticated, registrationCtrl.getRecapUser );

// Get organisateur a recap
router.post('/pre-inscription/:id', registrationCtrl.getRecapOrganisateur );

// Get a file excell
router.get('/checkout/:id', ensureAuthenticated, registrationCtrl.getFileExcell )

// Get a file GmCAP
router.post('/checkout/:id', registrationCtrl.getFileGmcap )

module.exports = router;