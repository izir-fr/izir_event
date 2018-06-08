// Credentials
var credentials = require('../config/credentials')
// Email config
var smtpTransport = require('nodemailer').createTransport(credentials.smtpCredits)

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var User = require('../models/user')

// Controllers
var organsisateurCtrl = {
  // Get all épreuves
  getEpreuves: function (req, res) {
    Event.find({author: req.user.id}, function (err, event) {
      if (err) throw err
      res.render('partials/organisateurs/event-list', {event: event})
    })
  },
  // Get contact form
  getContacter: function (req, res) {
    Registration.findById(req.params.id).populate('event').exec((err, data) => {
      if (err) {
        res.render('partials/user/profil/' + req.user.id, {error: err})
      } else {
        res.render('partials/organisateurs/contacter', data)
      }
    })
  },
  // Post contact form
  postContacter: function (req, res) {
    var event = req.body.event_id

    var mailOptions = {
      to: req.body.prenom_participant + ' ' + req.body.nom_participant + ' <' + req.body.email_participant + '>',
      bcc: req.body.event_name + ' <' + req.body.email_organisateur + '>',
      from: req.body.event_name + ' <' + req.body.email_organisateur + '>',
      subject: 'informations complémentaires ' + req.body.event_name,
      text: req.body.description
    }

    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        req.flash('success_msg', 'Votre message a bien été envoyé à ' + req.body.prenom_participant + ' ' + req.body.nom_participant)
      }
      req.flash('success_msg', 'Votre message a bien été envoyé à ' + req.body.prenom_participant + ' ' + req.body.nom_participant)
      res.redirect('/inscription/recap/organisateur/' + event)
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
        updated: new Date()
      }
    } catch (err) {
      req.flash('error', err)
      res.redirect('/organisateur/comptabilite/' + req.user.id)
    }

    console.log(updateUser)

    User.findByIdAndUpdate(req.user.id, updateUser, function (err, user) {
      if (err) {
        req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre RIB')
        res.redirect('/organisateur/comptabilite/' + req.user.id)
      } else {
        req.flash('success_msg', 'Votre RIB a été mis à jour')
        res.redirect('/user/profil/' + req.user.id + '/')
      }
    })
  }
}

module.exports = organsisateurCtrl
