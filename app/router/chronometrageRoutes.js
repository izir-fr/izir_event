var express = require('express')
var router = express.Router()

// Controllers
var chronometrageCtrl = require('../controllers/chronometrageController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Get chronometrage download choice
router.get('/event/:id', ensureAuthenticated, chronometrageCtrl.getChronometrage)

// Get checkout form
router.get('/file/excel/:id', ensureAuthenticated, chronometrageCtrl.getFileExcell)

// Post a checkout
router.get('/file/gmcap/:id', ensureAuthenticated, chronometrageCtrl.getFileGmcap)

module.exports = router
