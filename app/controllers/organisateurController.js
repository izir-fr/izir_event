// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var User = require('../models/user')
var Notification = require('../models/notification')

// Controllers
var organsisateurCtrl = {
  // Get all épreuves
  getEpreuves: function (req, res) {
    Event
      .find({ author: req.user.id })
      .sort({ created_at: -1 })
      .exec((err, event) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
        res.render('partials/organisateurs/event-list', {event: event})
      })
  },
  // Get contact form
  getContacter: function (req, res) {
    Registration
      .findById(req.params.id)
      .populate('event')
      .exec((err, data) => {
        if (err) {
          res.render('partials/user/profil/' + req.user.id, {error: err})
        } else {
          res.render('partials/organisateurs/contacter', {data: data})
        }
      })
  },
  // Post contact form
  postContacter: function (req, res) {
    var message = {
      sender: req.user.id,
      receiver: [req.body.id_participant],
      message: 'informations complémentaires ' + req.body.event_name + ' - ' + req.body.description
    }

    // create notification paiement
    var notification = new Notification(message)

    // save notification
    notification
      .save((err, notification) => {
        if (err) { req.flash('error_msg', 'Une erreur est survenue') }
        // EMAIL NOTIFICATION
        require('../../custom_modules/app/notification/notification-email')(req.body.id_participant)

        // set headers
        req.flash('success_msg', 'Votre message a bien été envoyé à ' + req.body.prenom_participant + ' ' + req.body.nom_participant)

        // set redirection
        res.redirect('/inscription/recap/organisateur/' + req.body.event_id)
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
