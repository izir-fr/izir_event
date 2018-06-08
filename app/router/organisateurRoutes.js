var express = require('express')
var router = express.Router()

// Controllers
var organisateurCtrl = require('../controllers/organisateurController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Get all épreuves
router.get('/epreuves', ensureAuthenticated, organisateurCtrl.getEpreuves)

// Get contact form
router.get('/contacter/:id', ensureAuthenticated, organisateurCtrl.getContacter)

// Post contact form
router.post('/contacter/:id', organisateurCtrl.postContacter)

// Get comptabilité
router.get('/comptabilite/:id', ensureAuthenticated, organisateurCtrl.getComptabilite)

// Post comptabilité
router.post('/comptabilite/:id', organisateurCtrl.postComptabilite)

module.exports = router
