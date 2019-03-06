var express = require('express')
var router = express.Router()

// Controllers
var registrationCtrl = require('../controllers/registrationController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

/*
USER
*/

// Get a pre-inscription form  => VERIFIE OK
router.get('/recap/user/:user', ensureAuthenticated, registrationCtrl.getRecapUser)

// Get user all inscription recap =>  VERIFIE OK
router.get('/:registration/delete', ensureAuthenticated, registrationCtrl.postDelete)

// Get user all inscription recap =>  VERIFIE OK
router.get('/:registration/participant', ensureAuthenticated, registrationCtrl.cartParticipantUpdate)

// Post Ajax pre-inscription  => VERIFIE OK
router.post('/:registration/participant/post', registrationCtrl.postParticipantUpdate)

// Get render certificat update form => VERIFIE OK
router.get('/:id/certificat', ensureAuthenticated, registrationCtrl.getCertificat)

// Post a certificat  => VERIFIE OK
router.post('/:id/certificat/post', registrationCtrl.postCertificat)

// Get user all inscription recap
router.get('/:id/team', ensureAuthenticated, registrationCtrl.cartTeamUpdate)

// Post Ajax pre-inscription
router.post('/:id/team/post', registrationCtrl.postAjaxCartTeamUpdate)

// Get render certificat update form
router.get('/:id/certificat/team', ensureAuthenticated, registrationCtrl.getCertificatTeam)

// Post a certificat
router.post('/:id/certificat/team/:member/post', registrationCtrl.postCertificatTeam)

/*
ORGANISATEUR
*/

// Post a pre-inscription  => VERIFIE OK
router.get('/recap/organisateur/:id', ensureAuthenticated, registrationCtrl.getRecapOrganisateur)

// Set other paiement captured  => VERIFIE OK
router.get('/checkout/:id/other-captured', ensureAuthenticated, registrationCtrl.getOtherPaiementCaptured)

router.get('/:id/certificat/reject', ensureAuthenticated, registrationCtrl.setCertificatReject)

router.get('/checkout/:id/validate', ensureAuthenticated, registrationCtrl.setCheckoutValidate)

module.exports = router
