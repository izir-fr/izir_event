var express = require('express')
var router = express.Router()

// Controllers
var registrationCtrl = require('../controllers/registrationController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Get a pre-inscription form
router.get('/recap/user/:id', ensureAuthenticated, registrationCtrl.getRecapUser)

// Post a pre-inscription
router.get('/recap/organisateur/:id', ensureAuthenticated, registrationCtrl.getRecapOrganisateur)

// Get user all inscription recap
router.get('/pre-inscription/:id', ensureAuthenticated, registrationCtrl.getPreinscription)

// Get organisateur a recap
// router.post('/pre-inscription/:id', registrationCtrl.postPreinscription)

// Post Ajax pre-inscription
router.post('/pre-inscription/:id/post', registrationCtrl.postAjaxPreinscription)

// Get a file excell
router.get('/checkout/:id', ensureAuthenticated, registrationCtrl.getCheckout)

// Get a other paiement
router.get('/checkout/:id/other-paiement', ensureAuthenticated, registrationCtrl.getOtherPaiement)

// Get a other paiement captured
router.get('/checkout/:id/other-captured', ensureAuthenticated, registrationCtrl.getOtherCaptured)

// Get a file GmCAP
router.post('/checkout/:id', registrationCtrl.postCheckout)

module.exports = router
