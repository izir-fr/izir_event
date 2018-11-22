// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var User = require('../models/user')
var Notification = require('../models/notification')
var Product = require('../models/product')

var Promise = require('bluebird')

// Controllers
var organsisateurCtrl = {
  // Get all épreuves
  getEpreuves: function (req, res) {
    var events = new Promise((resolve, reject) => {
      Event
        .find({ author: req.user.id })
        .sort({ created_at: -1 })
        .exec((err, event) => {
          if (err) {
            reject(err)
          }
          resolve(event)
        })
    })

    var product = new Promise((resolve, reject) => {
      Product
        .find({ featured: true, published: true })
        .limit(1)
        .exec((err, product) => {
          if (err) {
            reject(err)
          }
          resolve(product[0])
        })
    })

    Promise
      .props({
        event: events,
        product: product
      })
      .then((val) => {
        res.render('partials/organisateurs/event-list', val)
      })
      .catch((err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
      })
  },
  // Get contact form
  getContacterSingle: function (req, res) {
    Registration
      .findOne({_id: req.params.registration})
      .populate('event')
      .exec((err, data) => {
        if (err) {
          res.render('partials/user/profil', { error: err })
        } else {
          res.render('partials/organisateurs/contacter', { data: data, single: true })
        }
      })
  },
  // Post contact form
  postContacterSingle: function (req, res) {
    Registration
      .findOne({ _id: req.params.registration })
      .populate('user')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect(req.headers.referer)
        }
        var message = {
          sender: req.user.id,
          receiver: [registration.user],
          message: 'informations complémentaires ' + registration.eventName + ' - ' + req.body.description
        }

        // create notification paiement
        var notification = new Notification(message)

        // save notification
        notification
          .save((err, notification) => {
            if (err) { req.flash('error_msg', 'Une erreur est survenue') }
            // EMAIL NOTIFICATION
            require('../../custom_modules/app/notification/notification-email')(registration.user)

            // set headers
            req.flash('success_msg', 'Votre message a bien été envoyé à ' + registration.user.name + ' ' + registration.user.surname)

            // set redirection
            res.redirect('/inscription/recap/organisateur/' + registration.event)
          })
      })
  },
  // Get contact form
  getContacterAll: function (req, res) {
    Event
      .findOne({_id: req.params.event})
      .exec((err, data) => {
        if (err) {
          res.render('partials/user/profil', {error: err})
        } else {
          res.render('partials/organisateurs/contacter', {data: data, all: true})
        }
      })
  },
  // Post contact form
  postContacterAll: function (req, res) {
    Registration
      .find({'event': req.params.event})
      .exec((err, data) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect(req.headers.referer)
        }
        var receiver = []
        data.forEach((val) => {
          receiver.push(val.user)
        })

        var message = {
          sender: req.user.id,
          receiver: receiver,
          message: 'informations complémentaires ' + data.eventName + ' - ' + req.body.description
        }

        // create notification paiement
        var notification = new Notification(message)

        // save notification
        notification
          .save((err, notification) => {
            if (err) { req.flash('error_msg', 'Une erreur est survenue') }
            // EMAIL NOTIFICATION
            receiver.forEach((val) => {
              require('../../custom_modules/app/notification/notification-email')(val)
            })

            // set headers
            req.flash('success_msg', 'Votre message a bien été envoyé à tous les participants')

            // set redirection
            res.redirect('/inscription/recap/organisateur/' + req.params.event)
          })
      })
  },
  // Get comptabilité
  getComptabilite: function (req, res) {
    res.render('partials/organisateurs/comptabilite')
  },
  // Post comptabilité
  postComptabilite: function (req, res) {
    try {
      var updateUser = {
        code_etablissement: req.body.code_etablissement,
        code_guichet: req.body.code_guichet,
        numero_de_compte: req.body.numero_de_compte,
        cle_RIB: req.body.cle_RIB,
        titulaire: req.body.titulaire,
        updated: new Date()
      }
    } catch (err) {
      req.flash('error_msg', err)
      res.redirect('/organisateur/comptabilite/' + req.user.id)
    }

    User.findByIdAndUpdate(req.user.id, updateUser, function (err, user) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour de votre RIB')
        res.redirect('/organisateur/comptabilite/' + req.user.id)
      } else {
        req.flash('success_msg', 'Votre RIB a été mis à jour')
        res.redirect('/user/profil/' + req.user.id + '/')
      }
    })
  }
}

module.exports = organsisateurCtrl
