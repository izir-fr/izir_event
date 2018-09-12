var express = require('express')
var router = express.Router()

// Controllers
var notificationCtrl = require('../controllers/notificationController')

// get ajax unread notification
router.get('/receive/', notificationCtrl.getUnreadNotifications)

// get all user notifications
router.get('/receive/:user', notificationCtrl.getAllNotifications)

// mark as read user notification
router.get('/receive/:user/readen', notificationCtrl.setReadNotifications)

module.exports = router
