var express = require('express')
var router = express.Router()

// Controllers
var organisateurCtrl = require('../controllers/organisateurController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Get all épreuves
router.get('/epreuves', ensureAuthenticated, organisateurCtrl.getEpreuves)

// Get contact form
router.get('/contacter/:event/single/:registration', ensureAuthenticated, organisateurCtrl.getContacterSingle)
router.get('/contacter/:event/all', ensureAuthenticated, organisateurCtrl.getContacterAll)

// Post contact form
router.post('/contacter/:event/single/:registration', organisateurCtrl.postContacterSingle)
router.post('/contacter/:event/all', organisateurCtrl.postContacterAll)

// Get comptabilité
router.get('/comptabilite/:id', ensureAuthenticated, organisateurCtrl.getComptabilite)

// Post comptabilité
router.post('/comptabilite/:id', organisateurCtrl.postComptabilite)

module.exports = router
