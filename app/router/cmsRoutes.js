var express = require('express')
var router = express.Router()

// Controllers
var cmsCtrl = require('../controllers/cmsController')

// ---------------- INDEX ----------------
// Get Homepage
router.get('/', cmsCtrl.index)

// ---------------- CMS ----------------
// Get "l'entreprise"
router.get('/info/entreprise', cmsCtrl.entreprise)

// Get "nos partenaires"
router.get('/info/partenaires', cmsCtrl.partenaires)

// Get "nos medias"
router.get('/info/medias', cmsCtrl.medias)

// Get "tarifs"
router.get('/info/tarifs', cmsCtrl.tarifs)

// Get "contact"
router.get('/info/contact', cmsCtrl.contact)

// Get "Mentions légales"
router.get('/info/mentions-legales', cmsCtrl.mentionsLegales)

// Get "CGV"
router.get('/info/cgv', cmsCtrl.cgv)

// Get "Conditons d'utilisation"
router.get('/info/cgu', cmsCtrl.cgu)

// Get "FAQ"
router.get('/info/faq', cmsCtrl.faq)

// Get "Comptabilité"
router.get('/info/comptabilite', cmsCtrl.comptabilite)

// Get "Sécurité"
router.get('/info/securite', cmsCtrl.securite)

// Get "Commande"
router.get('/info/commande', cmsCtrl.commande)

// Get "Remboursement"
router.get('/info/remboursement', cmsCtrl.remboursement)

module.exports = router
