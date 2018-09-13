var Notification = require('../models/notification')

var notificationController = {
  getUnreadNotifications: (req, res) => {
    Notification
      .find({ 'receiver': req.user.id, 'read_by.readerId': { $ne: req.user.id } })
      .exec((err, notifications) => {
        if (err) {
          throw err
        }
        res.send(notifications)
      })
  },
  getAllNotifications: (req, res) => {
    Notification
      .find({ receiver: req.user.id, 'read_by.readerId': { $ne: req.user.id } })
      .populate('sender')
      .sort({created_at: -1})
      .exec((err, notifications) => {
        if (err) {
          throw err
        }
        res.render('partials/notifications/get-all', {notifications: notifications})
      })
  },
  setReadNotifications: (req, res) => {
    var readBy = {
      'readerId': req.user.id,
      'read_at': new Date(Date.now())
    }

    Notification
      .update({
        receiver: req.user.id, 'read_by.readerId': { $ne: req.user.id }
      }, {
        $push: { 'read_by': readBy }
      }, {
        multi: true
      }, (err, doc) => {
        if (err) {
          throw err
        }
        res.redirect('/notifications/receive/' + req.user.id)
      })
  }
}

module.exports = notificationController
