var express = require('express')
var router = express.Router()

// Controllers
var organisateurCtrl = require('../controllers/organisateurController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Get all épreuves
router.get('/events', ensureAuthenticated, organisateurCtrl.getEpreuves)

// Get messages page
router.get('/event/:event/messages', ensureAuthenticated, organisateurCtrl.getMessagesPage)
router.get('/event/:event/messages/group/no-certificat', ensureAuthenticated, organisateurCtrl.getGroupNoCertificat)
router.get('/event/:event/messages/group/no-paiement', ensureAuthenticated, organisateurCtrl.getGroupNoPaiement)
router.get('/event/:event/options', ensureAuthenticated, organisateurCtrl.getOptions)

// Post message form
router.post('/event/:event/message/create', organisateurCtrl.postMessage)

// Get comptabilité
router.get('/comptabilite/:id', ensureAuthenticated, organisateurCtrl.getComptabilite)

// Post comptabilité
router.post('/comptabilite/:id', organisateurCtrl.postComptabilite)

module.exports = router
