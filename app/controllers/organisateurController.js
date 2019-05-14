// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var User = require('../models/user')
var Notification = require('../models/notification')

var Promise = require('bluebird')
var product = require('../models/product').productSuggestion

// Controllers
var organsisateurCtrl = {
  // Get all épreuves
  getEpreuves: function (req, res) {
    var events = new Promise((resolve, reject) => {
      Event
        .find({ author: req.user.id })
        .populate('epreuves')
        .sort({ created_at: -1 })
        .exec((err, event) => {
          if (err) {
            reject(err)
          }
          resolve(event)
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
  },
  getMessagesPage: (req, res) => {
    var inscriptions = new Promise((resolve, reject) => {
      Registration
        .find({ event: req.params.event })
        .populate('user')
        .exec((err, registrations) => {
          if (err) {
            reject(err)
          }

          var contacts = []

          if (registrations.length >= 1) {
            // convert dossiers to inscriptions
            registrations.forEach((registration) => {
              var contactExist = contacts.find((search) => {
                return registration.user._id === search.user._id
              })
              if (!contactExist) {
                contacts.push(registration)
              }
            })

            contacts.sort((a, b) => {
              if (a.participant.nom !== undefined) {
                return a.participant.nom.localeCompare(b.participant.nom)
              }
            })
          } else {
            contacts = registrations
          }

          resolve(contacts)
        })
    })

    var event = new Promise((resolve, reject) => {
      Event
        .findById(req.params.event)
        .exec((err, event) => {
          if (err) {
            reject(err)
          }
          resolve(event)
        })
    })

    var notifications = new Promise((resolve, reject) => {
      Notification
        .find({ $or: [ { event: req.params.event }, { sender: req.user._id } ] })
        .populate('receiver')
        .sort({created_at: -1})
        .exec((err, notifications) => {
          if (err) {
            reject(err)
          }
          resolve(notifications)
        })
    })

    Promise
      .props({
        event: event,
        inscriptions: inscriptions,
        notifications: notifications
      })
      .then((data) => {
        if (String(data.event.author) === String(req.user._id) || String(req.user._id) === process.env.ADMIN) {
          res.render('partials/organisateurs/messages', data)
        } else {
          req.flash('error_msg', 'Vous n\'êtes pas autorisé à accéder à cette page')
          res.redirect(req.headers.referer)
        }
      })
      .catch((err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page de messagerie')
          res.redirect('/organisateur/events')
        }
      })
  },
  // Post contact form
  postMessage: function (req, res) {
    Event
      .findById(req.params.event)
      .exec((err, event) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect(req.headers.referer)
        }

        if (String(event.author) === String(req.user._id)) {
          var receivers = []
          if (req.body.receiver !== undefined) {
            if (req.body.receiver.constructor === Array) {
              receivers = req.body.receiver
            } else {
              if (req.body.receiver !== undefined && req.body.receiver !== null && req.body.receiver !== '') {
                receivers.push(req.body.receiver)
              }
            }
          }

          var message = {
            sender: req.user.id,
            receiver: receivers,
            event: event._id,
            registration: req.body.registration,
            message: 'informations complémentaires ' + event.name + ' - ' + req.body.description
          }

          if (receivers.length >= 1) {
            // create notification paiement
            var notification = new Notification(message)
            // save notification
            notification
              .save((err, notification) => {
                if (err) { req.flash('error_msg', 'Une erreur est survenue') }
                // EMAIL NOTIFICATION
                receivers.forEach((val) => {
                  require('../../custom_modules/app/notification/notification-email')(val)
                })

                // set headers
                req.flash('success_msg', 'Votre message a bien été envoyé à tous les participants')

                // set redirection
                res.redirect('/organisateur/event/' + req.params.event + '/messages')
              })
          } else {
            req.flash('error_msg', 'Vous n\'avez sélectionné de participant à contacter')
            res.redirect(req.headers.referer)
          }
        } else {
          req.flash('error_msg', 'Vous n\'avez les droits pour envoyer des messages aux participants de cette événements')
          res.redirect(req.headers.referer)
        }
      })
  },
  getGroupNoCertificat: (req, res) => {
    Registration
      .find({ event: req.params.event })
      .select({ 'participant.nom': 1, 'participant.prenom': 1, user: 1, 'docs.certificat': 1 })
      .exec((err, registrations) => {
        if (err) {
          res.send({ error: true })
        }
        var cleanedData = []
        if (registrations.length >= 1) {
          registrations.forEach((registration) => {
            if (registration.docs !== undefined && registration.docs !== null && registration.docs !== '') {
              if (registration.docs.certificat === '' || registration.docs.certificat === null || registration.docs.certificat === undefined) {
                cleanedData.push(registration)
              }
            }
          })
        }
        res.send(cleanedData)
      })
  },
  getGroupNoPaiement: (req, res) => {
    Registration
      .find({
        event: req.params.event, 'paiement.captured': false, 'paiement.other_captured': false
      })
      .select({ 'participant.nom': 1, 'participant.prenom': 1, user: 1 })
      .exec((err, registrations) => {
        if (err) {
          res.send({ error: true })
        }
        res.send(registrations)
      })
  }
}

module.exports = organsisateurCtrl
