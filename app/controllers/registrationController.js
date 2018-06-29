var async = require('async')
var nodemailer = require('nodemailer')

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
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
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
        certificat: req.body.certificat_file
      },
      updated: new Date()
    })
    // console.log(registration)

    // enregistrement de la pré-commande
    registration.save(function (err, registration) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }

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
      smtpTransport.sendMail(mailOptions, (err) => {
        if (err) throw err
      })

      req.flash('success_msg', 'Vos informations d\'inscription ont bien été prises en compte')
      res.redirect('/inscription/checkout/' + registration.id)
    })
  },
  // Get checkout form
  getCheckout: function (req, res) {
    Registration.find({_id: req.params.id}).populate('event').exec(function (err, registration) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
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
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/')
        } else {
          Registration.find({_id: id}).populate('event').exec(function (err, registrations) {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue lors de l\'envoie du mail de confirmation')
              res.redirect('/user/profil/')
            } else {
              var permanence = registrations[0].event.permanence
              var userEmail = registrations[0].participant.email
              var val = registrations[0]
              // send permanance email
              var mailOptions = {
                to: userEmail,
                from: 'Event Izir <event@izir.fr>',
                subject: 'Confirmation du mode de paiement de l\'inscription N°' + id,
                text: 'Nous avons le plaisir de vous confirmer que votre inscription a bien été prise en compte. \n\n' +
                    'Vous avez choisi le mode de paiement "chèque / espèce". De ce fait, la validation de votre inscription est réalisée manuelement par l\'organisateur. Celui-ci validera votre inscription lors de son paiement. Le paiement de votre inscription est à réaliser directement à l\'organisateur, ce qui lui permettera de valider votre inscription dès sa réception. \n\n' +
                    'Le paiement est réalisable: \n' +
                    '- sur le lieu de l\'épreuve, le jour de celle-ci.\n' +
                    '- voie postale si celui-ci vous le permet (à voir avec la permanance de l\'organisation par email: ' + permanence.email + ' ou par téléphone: ' + permanence.telephone + ') \n\n' +
                    'Nous vous invitons donc à vous rapprochez de l\'organisateur pour finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + val.eventName + '.\n\n' +
                    'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + val.user + '\n\n' +
                    'Bonne course !\n\n' +
                    'Nicolas de izir.fr'
              }
              smtpTransport.sendMail(mailOptions, (err) => {
                if (err) throw err
              })
              // REDIRECTION
              req.flash('success_msg', 'Votre inscription à bien été prise en compte et est en attente de paiement')
              res.redirect('/inscription/checkout/' + id)
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
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/')
        }
        Registration.findById(id, (err, val) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue lors de la validation du paiement')
            res.redirect('/inscription/recap/organisateur/' + val.event)
          } else {
            // EMAIL NOTIFICATION
            var mailOptions = {
              to: val.participant.email,
              from: 'Event Izir <event@izir.fr>',
              subject: 'Confirmation de paiement de l\'inscription N° ' + id,
              text: 'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte et que votre inscription N°' + id + ' est validée. \n\n' +
                  'Vous venez donc de finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + val.eventName + '.\n\n' +
                  'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + val.user + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
            }
            smtpTransport.sendMail(mailOptions, (err) => {
              if (err) throw err
            })
            // REDIRECTION
            req.flash('success_msg', 'L\'inscription N°' + id + ' est mise à jour avec un paiement guichet (chèque / espèces) et validée')
            res.redirect('/inscription/recap/organisateur/' + val.event)
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
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/user/profil/')
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
              req.flash('error_msg', 'Une erreure est survenue lors du paiement')
              res.redirect('/user/profil/')
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
              smtpTransport.sendMail(mailOptions, (err) => {
                if (err) throw err
              })

              // REDIRECTION
              req.flash('success_msg', 'Votre paiement à bien été pris en compte et votre inscription validée')
              res.redirect('/inscription/recap/user/' + req.user.id + '/')
            }
          })
        }
      })
  },
  // Get user all inscription recap
  getRecapUser: function (req, res) {
    Registration
      .find({ user: req.user.id })
      .sort({ created_at: -1 })
      .populate('event')
      .exec(function (err, registrations) {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
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
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      if (String(req.user.id) === String(results.event.author)) {
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
      } else {
        req.flash('error_msg', 'Vous n\'êtes pas l\'administrateur de cet événement')
        res.redirect('/organisateur/epreuves')
      }
    })
  }
}

module.exports = registrationCtrl
