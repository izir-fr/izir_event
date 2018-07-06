var async = require('async')
var fs = require('fs')
var json2csv = require('json2csv')

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var User = require('../models/user')

var chronometrageCtrl = {
  getAllChronometrageEvent: (req, res) => {
    Event
      .find({ chronometreur: req.user.id })
      .exec((err, events) => {
        if (err) {
          res.redirect('/')
        }
        var data = {
          event: events
        }
        res.render('partials/chronometrage/all-events', data)
      })
  },
  getChronometrageEvent: (req, res) => {
    Event
      .findOne({ _id: req.params.id })
      .populate('chronometreur')
      .exec((err, event) => {
        if (err) {
          res.redirect('/')
        }
        if (String(req.user.id) === String(event.author) || String(req.user.id) === String(event.chronometreur.id)) {
          var profil
          if (String(req.user.id) === String(event.author)) {
            profil = {
              organisateur: true
            }
          } else {
            profil = {
              chronometreur: true
            }
          }
          var data = {
            profil,
            event
          }
          res.render('partials/chronometrage/one-event', data)
        } else {
          res.redirect('/')
        }
      })
  },
  postAddChronometreur: (req, res) => {
    User
      .findOne({ email: req.body.chronometreur_email })
      .select({
        email: 1,
        _id: 1
      })
      .exec((err, user) => {
        if (err || user === null) {
          req.flash('error_msg', 'Aucun compte n\'est associé à cet email, merci de contacter votre chronométreur pour qu\'il crée un compte ou vous donne l\'email qu\'il utilise sur la plateforme')
          res.redirect('/chronometrage/event/' + req.params.id)
        } else {
          Event
            .findOneAndUpdate({ _id: req.params.id },
              {$set: {'chronometreur': user.id}}
            )
            .exec((err, event) => {
              if (err) {
                res.redirect('/chronometrage/event/' + req.params.id)
              } else {
                res.redirect('/chronometrage/event/' + event.id)
              }
            })
        }
      })
  },
  // Get a file excell
  getFileExcell: function (req, res) {
    async.parallel({
      event: function (next) {
        Event
          .findById(req.params.id)
          .exec(next)
      },
      participants: function (next) {
        Registration
          .find({event: req.params.id})
          .populate('user')
          .exec(next)
      }
    }, function (err, results) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }

      var event = require('../../custom_modules/app/registrationToTeam')(results.participants)

      var inscriptions = []
      event.forEach((val) => {
        var paiement,
          certificat,
          categorie,
          cleanNaissance,
          anneeNaissance,
          moisNaissance,
          joursNaissance

        cleanNaissance = val.participant.dateNaissance.split('/')

        if (cleanNaissance.length > 0) {
          anneeNaissance = cleanNaissance[2]
          moisNaissance = cleanNaissance[1]
          joursNaissance = cleanNaissance[0]
        } else {
          anneeNaissance = cleanNaissance
          moisNaissance = ''
          joursNaissance = ''
        }

        var courses = []
        val.produits.forEach((val) => {
          if (val.produitsQuantite > 0 && val.produitsRef !== 'don') {
            courses.push(val.produitsRef)
          }
        })

        if (val.paiement.captured === true) {
          paiement = 'CB'
        } else if (val.paiement.other_captured === true) {
          paiement = 'AUTRE'
        } else {
          paiement = 'NON'
        }

        if (val.docs.certificat === null || val.docs.certificat === undefined || val.docs.certificat === '') {
          certificat = 'N'
        } else {
          certificat = 'O'
        }

        if (val.participant.categorie === "EA - École d'Athlétisme") {
          categorie = 1 // EA
        } else if (val.participant.categorie === 'PO - Poussins') {
          categorie = 2 // PO
        } else if (val.participant.categorie === 'BE - Benjamins') {
          categorie = 3 // BE
        } else if (val.participant.categorie === 'MI - Minimes') {
          categorie = 4 // MI
        } else if (val.participant.categorie === 'CA - Cadets') {
          categorie = 5 // CA
        } else if (val.participant.categorie === 'JU - Juniors') {
          categorie = 6 // JU
        } else if (val.participant.categorie === 'ES - Espoirs') {
          categorie = 7 // ES
        } else if (val.participant.categorie === 'SE - Seniors') {
          categorie = 8 // SE
        } else if (val.participant.categorie === 'V1 - Masters H et F') {
          categorie = 9 // V1
        } else if (val.participant.categorie === 'V2 - Masters H et F') {
          categorie = 10 // V2
        } else if (val.participant.categorie === 'V3 - Masters H et F') {
          categorie = 11 // V3
        } else if (val.participant.categorie === 'V4 - Masters H et F') {
          categorie = 12 // V4
        } else if (val.participant.categorie === 'V5 - Masters H et F') {
          categorie = 13 // V5
        } else if (val.participant.categorie === 'VE - Masters') {
          categorie = ''
        } else if (val.participant.categorie === 'BB - Baby Athlé') {
          categorie = ''
        } else {
          categorie = ''
        }

        inscriptions.push({
          NOM: val.participant.nom,
          PRENOM: val.participant.prenom,
          ADRESSE1: val.participant.adresse1,
          ADRESSE2: val.participant.adresse2,
          CODE: val.participant.codePostal,
          VILLE: val.participant.city,
          ETAT: '',
          PAYS: '',
          EMAIL: val.participant.email,
          TEL: val.telephone,
          SEXE: val.participant.sex,
          NUMERO: '',
          HANDICAP: '',
          LICENCE: val.participant.numLicence,
          ANNEE_NAISSANCE: anneeNaissance,
          MOIS_NAISSANCE: moisNaissance,
          JOURS_NAISSANCE: joursNaissance,
          CATEGORIE: categorie,
          TEMPS: '',
          CLUB: val.participant.team,
          CODECLUB: '',
          ORGANISME: '',
          NATION: '',
          COURSE: courses,
          DISTANCE: val.distance,
          PAYE: paiement,
          INVITE: 'N',
          ENVOICLASST: 'N',
          'CERTIF MEDICAL': certificat
        })
      })

      var fields = ['NOM', 'PRENOM', 'ADRESSE1', 'ADRESSE2', 'CODE', 'VILLE', 'ETAT', 'PAYS', 'EMAIL', 'TEL', 'SEXE', 'NUMERO', 'HANDICAP', 'LICENCE', 'ANNEE_NAISSANCE', 'MOIS_NAISSANCE', 'JOURS_NAISSANCE', 'CATEGORIE', 'TEMPS', 'CLUB', 'CODECLUB', 'ORGANISME', 'NATION', 'COURSE', 'DISTANCE', 'PAYE', 'INVITE', 'ENVOICLASST', 'CERTIF MEDICAL']

      try {
        var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del: ';', quotes: '' })
        fs.writeFile(req.params.id + '.csv', csv, 'ascii', (err) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue')
            res.redirect('/')
          } else {
            res.download('./' + req.params.id + '.csv')
          }
        })
      } catch (err) {
        req.flash('error_msg', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.')
        res.redirect('/inscription/recap/organisateur/' + req.user.id)
      }
    })
  },
  // Get a file GmCAP
  getFileGmcap: function (req, res) {
    async.parallel({
      event: function (next) {
        Event.findById(req.params.id).exec(next)
      },
      participants: function (next) {
        Registration.find({event: req.params.id}).populate('user').exec(next)
      }
    }, function (err, results) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }

      var event = require('../../custom_modules/app/registrationToTeam')(results.participants)

      var inscriptions = []
      event.forEach((val) => {
        var paiement,
          certificat,
          categorie,
          cleanNaissance,
          anneeNaissance

        cleanNaissance = val.participant.dateNaissance.split('/')

        if (cleanNaissance.length > 0) {
          anneeNaissance = cleanNaissance[2]
        } else {
          anneeNaissance = cleanNaissance
        }

        var courses = []
        val.produits.forEach((val) => {
          if (val.produitsQuantite > 0 && val.produitsRef !== 'don') {
            courses.push(val.produitsRef)
          }
        })

        if (val.paiement.captured === true) {
          paiement = 'O'
        } else if (val.paiement.other_captured === true) {
          paiement = 'O'
        } else {
          paiement = 'N'
        }

        if (val.docs.certificat === null || val.docs.certificat === undefined || val.docs.certificat === '') {
          certificat = 'N'
        } else {
          certificat = 'O'
        }

        if (val.participant.categorie === "EA - École d'Athlétisme") {
          categorie = 1 // EA
        } else if (val.participant.categorie === 'PO - Poussins') {
          categorie = 2 // PO
        } else if (val.participant.categorie === 'BE - Benjamins') {
          categorie = 3 // BE
        } else if (val.participant.categorie === 'MI - Minimes') {
          categorie = 4 // MI
        } else if (val.participant.categorie === 'CA - Cadets') {
          categorie = 5 // CA
        } else if (val.participant.categorie === 'JU - Juniors') {
          categorie = 6 // JU
        } else if (val.participant.categorie === 'ES - Espoirs') {
          categorie = 7 // ES
        } else if (val.participant.categorie === 'SE - Seniors') {
          categorie = 8 // SE
        } else if (val.participant.categorie === 'V1 - Masters H et F') {
          categorie = 9 // V1
        } else if (val.participant.categorie === 'V2 - Masters H et F') {
          categorie = 10 // V2
        } else if (val.participant.categorie === 'V3 - Masters H et F') {
          categorie = 11 // V3
        } else if (val.participant.categorie === 'V4 - Masters H et F') {
          categorie = 12 // V4
        } else if (val.participant.categorie === 'V5 - Masters H et F') {
          categorie = 13 // V5
        } else if (val.participant.categorie === 'VE - Masters') {
          categorie = ''
        } else if (val.participant.categorie === 'BB - Baby Athlé') {
          categorie = ''
        } else {
          categorie = ''
        }

        inscriptions.push({
          NOM: val.participant.nom,
          PRENOM: val.participant.prenom,
          ADRESSE1: val.participant.adresse1,
          ADRESSE2: val.participant.adresse2,
          CODE: val.participant.codePostal,
          VILLE: val.participant.city,
          ETAT: '',
          PAYS: '',
          EMAIL: val.participant.email,
          TEL: val.telephone,
          SEXE: val.participant.sex,
          NUMERO: '',
          HANDICAP: '',
          LICENCE: val.participant.numLicence,
          NAISSANCE: anneeNaissance,
          CATEGORIE: categorie,
          TEMPS: '',
          CLUB: val.participant.team,
          CODECLUB: '',
          ORGANISME: '',
          NATION: '',
          COURSE: courses,
          DISTANCE: val.distance,
          PAYE: paiement,
          INVITE: 'N',
          ENVOICLASST: 'N',
          'CERTIF MEDICAL': certificat
        })
      })

      var fields = ['NOM', 'PRENOM', 'ADRESSE1', 'ADRESSE2', 'CODE', 'VILLE', 'ETAT', 'PAYS', 'EMAIL', 'TEL', 'SEXE', 'NUMERO', 'HANDICAP', 'LICENCE', 'NAISSANCE', 'CATEGORIE', 'TEMPS', 'CLUB', 'CODECLUB', 'ORGANISME', 'NATION', 'COURSE', 'DISTANCE', 'PAYE', 'INVITE', 'ENVOICLASST', 'CERTIF MEDICAL']

      try {
        var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del: '\t', quotes: '' })
        fs.writeFile(req.params.id + '.txt', csv, 'ascii', (err) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue')
            res.redirect('/')
          }
          res.download('./' + req.params.id + '.txt')
        })
      } catch (err) {
        req.flash('error_msg', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.')
        res.redirect('/inscription/recap/organisateur/' + req.user.id)
      }
    })
  }
}

module.exports = chronometrageCtrl
