var async = require('async')
var fs = require('fs')
var nodemailer = require('nodemailer')
var json2csv = require('json2csv')

// Credentials
var credentials = require('../config/credentials')

// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')
var disList = require('../../custom_modules/lists/discipline-list')

// STRIPE
var stripe = require('stripe')(credentials.stripeKey.serveur)
// Email config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits)

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')

var registrationCtrl = {
  // Get a pre-inscription form
  getPreinscription: function (req, res) {
    async.parallel({
      event: function (next) {
        Event.findById(req.params.id).exec(next)
      },
      participants: function (next) {
        Registration.find({event: req.params.id}).exec(next)
      }
    }, function (err, results) {
      if (err) throw err
      var jourNaissance
      var moisNaissance
      var anneeNaissance
      var produisParticipant = results.participants
      var maxParticipant = results.event.epreuves
      var allProduits = []
      var uniqueProduit = []

      if (req.user.birthday !== '') {
        try {
          jourNaissance = req.user.birthday.split('/')[0]
          moisNaissance = req.user.birthday.split('/')[1]
          anneeNaissance = req.user.birthday.split('/')[2]
        } catch (err) {
          jourNaissance = ''
          moisNaissance = ''
          anneeNaissance = ''
        }
      } else {
        jourNaissance = ''
        moisNaissance = ''
        anneeNaissance = ''
      }

      /// /Single epreuve init participants
      maxParticipant.forEach((val) => {
        var epreuve = {
          name: val.name,
          max: val.placesDispo,
          quantity: 0,
          tarif: val.tarif,
          active: true
        }
        uniqueProduit.push(epreuve)
      })

      // allProduits create
      produisParticipant.forEach((val) => {
        var details = val.produits
        details.forEach((val) => {
          if (val.produitsSubTotal > 0) {
            allProduits.push(val.produitsRef)
          }
        })
      })

      // uniqueProduit calc
      allProduits.forEach((val) => {
        var unique = uniqueProduit.find((element) => {
          if (element.name === val) {
            return true
          }
        })
        if (unique !== undefined) {
          uniqueProduit.forEach((single) => {
            if (single.name === val) {
              single.quantity = single.quantity + 1
            }
          })
        }
      })

      uniqueProduit.forEach((val) => {
        if (val.quantity >= val.max) {
          val.active = false
        }
      })

      var data = {
        results: results,
        jourNaissance: jourNaissance,
        moisNaissance: moisNaissance,
        anneeNaissance: anneeNaissance,
        disponibility: uniqueProduit,
        date_list: dateList,
        category_list: catList,
        discipline_list: disList
      }

      res.render('partials/registration/pre-inscription', data)
    })
  },
  // Post a pre-inscription
  postPreinscription: function (req, res) {
    var produits = []
    var ref = req.body.ref
    var tarif = req.body.tarif
    var quantity = req.body.quantity
    var subtotal = req.body.subtotal
    var option
    // console.log(ref)

    // ajout des produits dans la commande
    if (subtotal.constructor === Array) {
      for (var i = 0; i < ref.length; i++) {
        // console.log(ref[i])
        option = {
          produitsRef: ref[i],
          produitsPrix: tarif[i],
          produitsQuantite: quantity[i],
          produitsSubTotal: subtotal[i]
        }
        produits.push(option)
      }
    } else {
      option = {
        produitsRef: ref,
        produitsPrix: tarif,
        produitsQuantite: quantity,
        produitsSubTotal: subtotal
      }
      produits.push(option)
    }
    // console.log(produits)

    // création de la pré-commande
    var registration = new Registration({
      user: req.user.id, // user
      event: req.params.id, // event
      eventName: req.body.eventName,
      participant: {
        nom: req.body.surname,
        prenom: req.body.name,
        email: req.body.email,
        sex: req.body.sex,
        dateNaissance: req.body.jourNaissance + '/' + req.body.moisNaissance + '/' + req.body.anneeNaissance,
        team: req.body.team,
        numLicence: req.body.numLicence,
        categorie: req.body.categorie,
        adresse1: req.body.adresse1,
        adresse2: req.body.adresse2,
        codePostal: req.body.codePostal,
        city: req.body.city
      },
      produits: produits, // toute le pack
      orderAmount: req.body.total,
      statut: 'pré-inscrit',
      docs: {
        certificat: req.body.certificats
      },
      updated: new Date()
    })
    // console.log(registration)

    // enregistrement de la pré-commande
    registration.save(function (err, registration) {
      if (err) throw err

      // Configuration du mail
      var mailOptions = {
        to: registration.participant.email,
        from: 'Event Izir <event@izir.fr>',
        subject: 'Récapitulatif d\'inscription N°' + registration.id,
        text: 'Bonjour,\n\n' +
        'vous venez de saisir les informations suivantes pour vous inscrire à l\'épreuve ' + registration.eventName + ' .\n\n' +
        'Voici les informations sur le participant qui sont transmises à l\'organisateur : \n\n' +
        ' - Nom : ' + registration.participant.nom + '.\n' +
        ' - Prénom : ' + registration.participant.prenom + '.\n' +
        ' - Email : ' + registration.participant.email + '.\n\n' +
        ' - Date de naissance : ' + registration.participant.dateNaissance + '.\n' +
        ' - Team : ' + registration.participant.team + '.\n' +
        ' - Sex : ' + registration.participant.sex + '.\n' +
        ' - Numéro de Licence : ' + registration.participant.numLicence + '.\n' +
        ' - Categorie : ' + registration.participant.categorie + '.\n' +
        ' - Adresse : ' + registration.participant.adresse1 + ' ' + registration.participant.adresse2 + ' ' + registration.participant.codePostal + ' ' + registration.participant.city + '.\n\n' +
        'Pour valider votre inscription, si ce n\'est déjà fait, n\'oubliez pas d\'effectuer votre règlement en ligne en suivant ce lien http://event.izir.fr/inscription/checkout/' + registration.id + '\n\n' +
        'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + req.user.id + '\n\n' +
        'Bonne course !\n\n' +
        'Nicolas de izir.fr'
      }
      // envoie du mail
      smtpTransport.sendMail(mailOptions)

      req.flash('success_msg', 'Vos informations d\'inscription ont bien été prises en compte')
      res.redirect('/inscription/checkout/' + registration.id)
    })
  },
  // Get checkout form
  getCheckout: function (req, res) {
    Registration.find({_id: req.params.id}).populate('event').exec(function (err, registration) {
      if (err) throw err
      var data = {
        registration: registration[0],
        stripe: parseInt(registration[0].orderAmount * 100 + 50),
        stripeFrontKey: credentials.stripeKey.front,
        orderAmount: registration[0].orderAmount * 1 + 0.50
      }
      // console.log(data)
      res.render('partials/registration/checkout', {data: data})
    })
  },
  getOtherPaiement: function (req, res) {
    var id = req.params.id
    // do somthings
    Registration.update(
      { _id: id },
      { $set: { 'paiement': { 'other': true }, 'updated': new Date(Date.now()) } },
      function (err, user) {
        if (err) {
          res.redirect('/user/profil/')
          req.flash('error', 'Une erreur est survenue lors du paiement')
        } else {
          Registration.find({_id: id}).populate('event').exec(function (err, registrations) {
            if (err) {
              res.redirect('/user/profil/')
              req.flash('error', 'Une erreur est survenue lors de l\'envoie du mail de confirmation')
            } else {
              var permanence = registrations[0].event.permanence
              var userEmail = registrations[0].participant.email
              var val = registrations[0]
              // send permanance email
              var mailOptions = {
                to: userEmail,
                from: 'Event Izir <event@izir.fr>',
                subject: 'Récapitulatif de paiement de l\'inscription N°' + id,
                text: 'Nous avons le plaisir de vous confirmer que votre demande d\'inscription a bien été prise en compte. \n\n' +
                    'Vous avez choisi le mode de paiement "chèque / espèce". De ce fait, la validation de votre inscription est réalisée manuelement par l\'organisateur. Celui-ci validera votre inscription lors de son paiement. Le paiement de votre inscription est à réaliser directement à l\'organisateur, ce qui lui permettera de valider votre inscription dès sa réception. \n\n' +
                    'Le paiement est réalisable: \n' +
                    '- sur le lieu de l\'épreuve, le jour de celle-ci.\n' +
                    '- voie postale si celui-ci vous le permet (à voir avec la permanance de l\'organisation par email: ' + permanence.email + ' ou par téléphone: ' + permanence.telephone + ') \n\n' +
                    'Nous vous invitons donc à vous rapprochez de l\'organisateur pour finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + val.eventName + '.\n\n' +
                    'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + val.user + '\n\n' +
                    'Bonne course !\n\n' +
                    'Nicolas de izir.fr'
              }
              smtpTransport.sendMail(mailOptions)
              // REDIRECTION
              res.redirect('/inscription/checkout/' + id)
              req.flash('success_msg', 'Votre inscription à bien été prise en compte et est en attente de paiement')
            }
          })
        }
      }
    )
  },
  getOtherCaptured: function (req, res) {
    var id = req.params.id
    // do somthings
    Registration.update(
      { _id: id },
      { $set: { 'paiement': { 'other_captured': true, 'other': true }, 'updated': new Date(Date.now()), 'statut': 'inscrit' } },
      function (err, val) {
        if (err) throw err
        Registration.findById(id, (err, val) => {
          if (err) {
            res.redirect('/inscription/recap/organisateur/' + val.event)
            req.flash('error', 'Une erreur est survenue lors de la validation du paiement')
          } else {
            // EMAIL NOTIFICATION
            var mailOptions = {
              to: val.participant.email,
              from: 'Event Izir <event@izir.fr>',
              subject: 'Confirmation de paiement et de validation de l\'inscription N° ' + id,
              text: 'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte et que votre inscription N°' + id + ' est validée. \n\n' +
                  'Vous venez donc de finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + val.eventName + '.\n\n' +
                  'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + val.user + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
            }
            smtpTransport.sendMail(mailOptions)
            // REDIRECTION
            res.redirect('/inscription/recap/organisateur/' + val.event)
            req.flash('success_msg', 'L\'inscription N°' + id + ' est mise à jour avec un paiement guichet (chèque / espèces) et validée')
          }
        })
      }
    )
  },
  // Post a checkout
  postCheckout: function (req, res) {
    var stripeCheckout = {
      amount: req.body.stripe,
      currency: 'eur',
      description: req.body.event,
      source: req.body.stripeToken
    }
    // console.log(stripeCheckout)

    // STIPE
    stripe.charges.create(
      stripeCheckout,
      function (err, charge) {
        // console.log(charge)

        if (err) {
          res.redirect('/user/profil/')
          req.flash('error', 'Une erreur est survenue lors du paiement')
        } else {
          // UPDATE registration.statut : "payé" + paiementCaptured
          Registration.update({_id: req.params.id}, {$set:
              {
                'statut': 'inscrit',
                'paiement': {
                  'amount': charge.amount,
                  'captured': charge.captured,
                  'id': charge.id,
                  'object': charge.object,
                  'date': charge.created
                }
              }
          }, function (err, user) {
            if (err) {
              res.redirect('/user/profil/')
              req.flash('error', 'Une erreure est survenue lors du paiement')
            } else {
            // console.log(user)
            // EMAIL NOTIFICATION
              var mailOptions = {
                to: req.user.email,
                from: 'Event Izir <event@izir.fr>',
                subject: 'Confirmation de paiement et de validation de l\'inscription N° ' + req.params.id,
                text: 'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte et que votre inscription N°' + req.params.id + ' est validée. \n\n' +
                  'Vous venez donc de finaliser votre incription N°' + req.params.id + ' pour l\'épreuve suivante : ' + req.body.event + '.\n\n' +
                  'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + req.user.id + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
              }
              smtpTransport.sendMail(mailOptions)

              // REDIRECTION
              res.redirect('/inscription/recap/user/' + req.user.id + '/')
              req.flash('success_msg', 'Votre paiement à bien été pris en compte et votre inscription validée')
            }
          })
        }
      })
  },
  // Get user all inscription recap
  getRecapUser: function (req, res) {
    Registration.find({ user: req.user.id }).populate('event').exec(function (err, registrations) {
      if (err) throw err
      res.render('partials/registration/recap-user', { registrations: registrations })
    })
  },
  // Get organisateur a recap
  getRecapOrganisateur: function (req, res) {
    async.parallel({
      event: function (next) {
        Event.findById(req.params.id).exec(next)
      },
      participants: function (next) {
        if (req.query.epreuve && req.query.epreuve !== 'Toutes') {
          Registration
            .find({ event: req.params.id, produits: { $elemMatch: { produitsRef: req.query.epreuve, produitsQuantite: { $ne: 0 } } } })
            .populate('user')
            .exec(next)
        } else {
          Registration.find({ event: req.params.id }).populate('user').exec(next)
        }
      }
    }, function (err, results) {
      if (err) throw err
      var event = results
      var paiement = []
      var dons = []
      results.participants.forEach((val) => {
        if (val.paiement.captured || val.paiement.other_captured) {
          val.produits.forEach((val) => {
            if (val.produitsRef === 'dons') {
              if (val.produitsSubTotal > 0) {
                dons.push(val)
              }
            } else {
              if (val.produitsSubTotal > 0) {
                paiement.push(val)
              }
            }
          })
        }
      })
      event.paiement = paiement
      event.totalPaiement = paiement.reduce((acc, curr) => {
        return acc + curr.produitsSubTotal
      }, 0)
      event.dons = dons
      res.render('partials/registration/recap-organisateur', event)
    })
  },
  // Get a file excell
  getFileExcell: function (req, res) {
    async.parallel({
      event: function (next) {
        Event.findById(req.params.id).exec(next)
      },
      participants: function (next) {
        Registration.find({event: req.params.id}).populate('user').exec(next)
      }
    }, function (err, results) {
      if (err) throw err
      var event = results.participants

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
          if (err) throw err
          res.download('./' + req.params.id + '.csv')
        })
      } catch (err) {
        req.flash('error', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.')
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
      if (err) throw err
      var event = results.participants

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
        var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del: '  ', quotes: '' })
        fs.writeFile(req.params.id + '.txt', csv, 'ascii', (err) => {
          if (err) throw err
          res.download('./' + req.params.id + '.txt')
        })
      } catch (err) {
        req.flash('error', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.')
        res.redirect('/inscription/recap/organisateur/' + req.user.id)
      }
    })
  }
}

module.exports = registrationCtrl
