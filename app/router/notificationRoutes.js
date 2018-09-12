var express = require('express')
var router = express.Router()

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Controllers
var notificationCtrl = require('../controllers/notificationController')

// get ajax unread notification
router.get('/receive/', ensureAuthenticated, notificationCtrl.getUnreadNotifications)

// get all user notifications
router.get('/receive/:user', ensureAuthenticated, notificationCtrl.getAllNotifications)

// mark as read user notification
router.get('/receive/:user/readen', ensureAuthenticated, notificationCtrl.setReadNotifications)

module.exports = router
