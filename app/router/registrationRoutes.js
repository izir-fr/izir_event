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

/*
REGISTRATION STEP 1
*/

// Get user all inscription recap
router.get('/cart/:id', ensureAuthenticated, registrationCtrl.getPreinscription)

// Post Ajax pre-inscription
router.post('/cart/:id/post', registrationCtrl.postAjaxCart)

/*
REGISTRATION STEP 2
*/

// Get user all inscription recap
router.get('/cart/:id/participant', ensureAuthenticated, registrationCtrl.cartParticipantUpdate)

// Post Ajax pre-inscription
router.post('/cart/:id/participant/post', registrationCtrl.postAjaxCartParticipantUpdate)

// Get user all inscription recap
router.get('/cart/:id/team', ensureAuthenticated, registrationCtrl.cartTeamUpdate)

// Post Ajax pre-inscription
router.post('/cart/:id/team/post', registrationCtrl.postAjaxCartTeamUpdate)
/*
REGISTRATION STEP 3
*/

// Get a other paiement
router.get('/checkout/:id/other-paiement', ensureAuthenticated, registrationCtrl.getOtherPaiement)

// Get a other paiement captured
router.get('/checkout/:id/other-captured', ensureAuthenticated, registrationCtrl.getOtherCaptured)

// Get a file excell
router.get('/checkout/:id', ensureAuthenticated, registrationCtrl.getCheckout)

// Post a paiement
router.post('/checkout/:id', registrationCtrl.postCheckout)

/*
REGISTRATION STEP 4
*/

// Get render certificat update form
router.get('/cart/:id/certificat', ensureAuthenticated, registrationCtrl.getCertificat)

// Post a certificat
router.post('/cart/:id/certificat/post', registrationCtrl.postCertificat)

/*
REGISTRATION STEP 5
*/

// Get confirmation page
router.get('/checkout/:id/confirmation', ensureAuthenticated, registrationCtrl.getConfirmation)

module.exports = router
