var async = require('async')

// Credentials
var credentials = require('../config/credentials')

// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')
var disList = require('../../custom_modules/lists/discipline-list')

// STRIPE
var stripe = require('stripe')(credentials.stripeKey.serveur)

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var Notification = require('../models/notification')

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

      var produisParticipant = results.participants
      var maxParticipant = results.event.epreuves
      var allProduits = []
      var uniqueProduit = []

      // Single epreuve init participants
      maxParticipant.forEach((val) => {
        var epreuve = {
          name: val.name,
          max: val.placesDispo,
          quantity: 0,
          tarif: val.tarif,
          active: true,
          team: val.team,
          teamMin: val.team_qty_min,
          teamMax: val.team_qty_max
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
        disponibility: uniqueProduit,
        date_list: dateList,
        category_list: catList,
        discipline_list: disList
      }

      res.render('partials/registration/step-cart', data)
    })
  },
  postAjaxCart: (req, res) => {
    var registration
    var produits = []
    var form = req.body
    var data = form.data
    var cart = data.cart
    var participant = data.participant
    var user = req.user._id
    var event = req.params.id
    var epreuveFormat = form.option.epreuve_format

    // some check
    if (!user) {
      // res.contentType('json')
      res.send({error_msg: 'Not logged user'})
    } else if (!event) {
      // res.contentType('json')
      res.send({error_msg: 'No event reconized'})
    } else {
      if (epreuveFormat.team && epreuveFormat.individuel) {
        req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
        res.redirect('/inscription/cart/' + event)
      } else if (!epreuveFormat.team && !epreuveFormat.individuel) {
        req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
        res.redirect('/inscription/cart/' + event)
      } else {
        // ajout des produits dans la commande
        cart.epreuve.forEach((val) => {
          produits.push({
            produitsRef: val.produit,
            produitsPrix: val.price,
            produitsQuantite: val.qty,
            produitsSubTotal: val.subTotal
          })
        })

        // ajout des options à la commande
        if (cart.options.length >= 1) {
          cart.options.forEach((val) => {
            produits.push({
              produitsRef: val.produit,
              produitsPrix: val.price,
              produitsQuantite: val.qty,
              produitsSubTotal: val.subTotal
            })
          })
        }

        // ajout des dons à la commande
        if (cart.dons) {
          if (cart.dons !== null && cart.dons !== '0') {
            produits.push({
              produitsRef: 'don',
              produitsPrix: 1,
              produitsQuantite: cart.dons,
              produitsSubTotal: cart.dons
            })
          }
        }

        // création du panier
        registration = new Registration({
          user: user, // user
          event: event, // event
          eventName: participant.event,
          produits: produits,
          orderAmount: cart.totalCart,
          options: {
            'epreuve_format': {
              team: epreuveFormat.team,
              individuel: epreuveFormat.individuel
            },
            'team_limits': {
              min: form.option.team.min,
              max: form.option.team.max
            }
          },
          statut: 'pré-inscrit',
          updated: new Date()
        })

        // enregistrement de la pré-commande
        registration.save(function (err, registration) {
          if (err) {
            res.send({ error_msg: 'Une erreur est survenue lors de l\'enregistrement de votre inscription' })
          } else {
            // create notification paiement
            var notification = new Notification({
              sender: req.user.id,
              receiver: [registration.user],
              message: 'Vous venez de commencer une inscription pour l\'épreuve ' + registration.eventName + ', vous pouvez a tout moment reprendre ou modifier cette inscription depuis votre compte, rubrique mes inscriptions.'
            })

            // save notification
            notification
              .save((err, notification) => {
                if (err) throw err
                // EMAIL NOTIFICATION
                require('../../custom_modules/app/notification/notification-email')(registration.user)
              })
            res.send({ redirect: '/inscription/cart/' + registration.id + '/participant' })
          }
        })
      }
    }
  },
  cartParticipantUpdate: (req, res) => {
    var data
    var jourNaissance
    var moisNaissance
    var anneeNaissance

    // origine test
    var origine = false
    if (req.query.origine === 'recap_user') {
      origine = {
        'recap_user': true
      }
    }

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

    Registration
      .find({_id: req.params.id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
          res.redirect('/inscription/cart/' + registration[0].event.id)
        }
        data = {
          results: registration[0],
          jourNaissance: jourNaissance,
          moisNaissance: moisNaissance,
          anneeNaissance: anneeNaissance,
          date_list: dateList,
          category_list: catList,
          discipline_list: disList,
          origine: origine
        }
        if (registration[0].options.epreuve_format.team === false && registration[0].options.epreuve_format.individuel === true) {
          res.render('partials/registration/step-participant', data)
        } else if (registration[0].options.epreuve_format.team === true && registration[0].options.epreuve_format.individuel === false) {
          res.redirect('/inscription/cart/' + req.params.id + '/team')
        } else {
          req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
          res.redirect('/inscription/cart/' + registration[0].event.id)
        }
      })
  },
  postAjaxCartParticipantUpdate: (req, res) => {
    var id = req.params.id
    // update registration
    Registration.update(
      { _id: id },
      { $set: {
        'participant': {
          'nom': req.body.surname,
          'prenom': req.body.name,
          'email': req.body.email,
          'sex': req.body.sex,
          'dateNaissance': req.body.jourNaissance + '/' + req.body.moisNaissance + '/' + req.body.anneeNaissance,
          'team': req.body.team,
          'numLicence': req.body.numLicence,
          'categorie': req.body.categorie,
          'adresse1': req.body.adresse1,
          'adresse2': req.body.adresse2,
          'codePostal': req.body.codePostal,
          'city': req.body.city
        },
        'updated': new Date(Date.now())
      }
      }, (err, user) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
          res.redirect('/inscription/cart/' + id + '/participant')
        } else {
          Registration
            .find({_id: id})
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
                res.redirect('/inscription/cart/' + id + '/participant')
              } else {
                var eventConfig = registration[0].event
                if (req.query.origine === 'recap_user') {
                  res.redirect('/inscription/recap/user/' + req.user.id)
                } else if (eventConfig.paiement) {
                  res.redirect('/inscription/checkout/' + id)
                } else if (eventConfig.certificat_required) {
                  res.redirect('/inscription/cart/' + id + '/certificat')
                } else {
                  res.redirect('/inscription/checkout/' + id + '/confirmation')
                }
              }
            })
        }
      })
  },
  cartTeamUpdate: (req, res) => {
    var data

    Registration
      .find({_id: req.params.id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de l\'événement')
          res.redirect('/inscription/cart/' + registration[0].event.id)
        }
        data = {
          results: registration[0],
          date_list: dateList,
          category_list: catList,
          discipline_list: disList
        }
        res.render('partials/registration/step-team', data)
      })
  },
  postAjaxCartTeamUpdate: (req, res) => {
    var id = req.params.id
    var capitaine = {
      nom: req.body.capitaine_name,
      prenom: req.body.capitaine_surname,
      email: req.body.capitaine_email,
      team: req.body.capitaine_team,
      codePostal: req.body.capitaine_cp,
      city: req.body.capitaine_city
    }

    var team = []

    req.body.member_nom.forEach((val, key) => {
      team.push({
        nom: req.body.member_nom[key],
        prenom: req.body.member_prenom[key],
        sex: req.body.member_sex[key],
        dateNaissance: req.body.membre_birth_day[key] + '/' + req.body.membre_birth_month[key] + '/' + req.body.membre_birth_year[key],
        team: req.body.capitaine_team,
        numLicence: req.body.member_license[key],
        email: req.body.member_email[key]
      })
    })

    Registration.update(
      { _id: id }, {
        $set: {
          'participant': capitaine,
          'team': team,
          'updated': new Date(Date.now())
        }
      }, (err, user) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
          res.redirect('/inscription/cart/' + id + '/team')
        } else {
          Registration
            .find({_id: id})
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
                res.redirect('/inscription/cart/' + id + '/team')
              } else {
                var eventConfig = registration[0].event
                if (eventConfig.paiement) {
                  res.redirect('/inscription/checkout/' + id)
                } else if (eventConfig.certificat_required) {
                  res.redirect('/inscription/cart/' + id + '/certificat')
                } else {
                  res.redirect('/inscription/checkout/' + id + '/confirmation')
                }
              }
            })
        }
      }
    )
  },
  getCertificat: (req, res) => {
    var id = req.params.id

    var member = false
    if (req.query.membre) {
      member = req.query.membre
    }

    Registration
      .find({_id: id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
        }
        var data = {results: registration[0], member: member}
        if (registration[0].options.epreuve_format.team && member === false) {
          res.redirect('/inscription/cart/' + id + '/certificat/team')
        } else {
          res.render('partials/registration/step-certificat', data)
        }
      })
  },
  postCertificat: (req, res) => {
    var id = req.params.id
    // update registration
    Registration.update(
      { _id: id }, {
        $set: {
          docs: {
            'certificat': req.body.certificat_file,
            'certificat_validation': true
          },
          'updated': new Date(Date.now())
        }
      }, (err, user) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
          res.redirect('/inscription/cart/' + id + '/certificat')
        } else {
          res.redirect('/inscription/checkout/' + id + '/confirmation')
        }
      }
    )
  },
  getCertificatTeam: (req, res) => {
    var id = req.params.id

    Registration
      .find({_id: id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
        }
        var data = {results: registration[0]}
        res.render('partials/registration/step-certificat-team', data)
      })
  },
  postCertificatTeam: (req, res) => {
    var id = req.params.id
    var member = req.params.member

    Registration.updateOne(
      { 'team._id': member }, {
        $set: {
          'team.$.docs': {
            'certificat': req.body.certificat_file,
            'certificat_validation': true
          }
        }
      }, (err, user) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
        }
        res.redirect('/inscription/cart/' + id + '/certificat')
      })
  },
  getConfirmation: (req, res) => {
    var registrationCheckup = {
      success: false,
      error_msg: '',
      error_step: {
        participant: false,
        team: false,
        paiement: false,
        certificat: false
      }
    }

    var id = req.params.id
    Registration
      .find({_id: id})
      .populate('event')
      .exec((err, registration) => {
        if (err || registration.length === 0) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
          res.redirect('/user/profil/' + req.user.id)
        } else {
          var organisateurValidation = registration[0].organisateur_validation
          if (organisateurValidation.participant && organisateurValidation.team && organisateurValidation.paiement && organisateurValidation.certificat) {
            registrationCheckup.success = true
          } else {
            if (!organisateurValidation.participant) {
              registrationCheckup.error_msg = 'Votre formulaire n\'est pas conforme'
              registrationCheckup.error_step.participant = true
            } else if (!organisateurValidation.team) {
              registrationCheckup.error_msg = 'Votre formulaire n\'est pas conforme'
              registrationCheckup.error_step.team = true
            } else if (!organisateurValidation.paiement) {
              registrationCheckup.error_msg = 'Votre paiement n\'est pas validé'
              registrationCheckup.error_step.paiement = true
            } else if (!organisateurValidation.certificat) {
              registrationCheckup.error_msg = 'Votre certificat n\'est pas conforme'
              registrationCheckup.error_step.certificat = true
            } else {
              registrationCheckup.error_msg = 'Une erreur inconnue est survenue, merci de contacter le service client à serviceclient@izir.fr'
            }
          }

          var data = {
            results: registration[0],
            registrationCheckup: registrationCheckup
          }
          res.render('partials/registration/step-confirmation', data)
        }
      })
  },
  // Get checkout form
  getCheckout: function (req, res) {
    // origine test
    var origine = false
    if (req.query.origine === 'recap_user') {
      origine = {
        'recap_user': true
      }
    }

    Registration
      .find({_id: req.params.id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
        var data = {
          data: {
            registration: registration[0],
            stripe: parseInt(registration[0].orderAmount * 100 + 50),
            stripeFrontKey: credentials.stripeKey.front,
            orderAmount: registration[0].orderAmount * 1 + 0.50
          },
          results: registration[0],
          origine: origine
        }
        res.render('partials/registration/step-checkout', data)
      })
  },
  getOtherPaiement: function (req, res) {
    var id = req.params.id
    // do somthings
    Registration.update(
      { _id: id }, {
        $set: {
          'paiement': { 'other': true },
          'updated': new Date(Date.now())
        }
      },
      (err, user) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/inscription/checkout/' + id)
        } else {
          Registration
            .find({_id: id})
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
                res.redirect('/inscription/checkout/' + id)
              } else {
                req.flash('success_msg', 'Votre paiement à bien été pris en compte')
                var eventConfig = registration[0].event
                if (eventConfig.certificat_required) {
                  res.redirect('/inscription/cart/' + id + '/certificat')
                } else {
                  res.redirect('/inscription/checkout/' + id + '/confirmation')
                }
              }
            })
        }
      }
    )
  },
  getOtherCaptured: (req, res) => {
    var id = req.params.id

    // update registrration
    Registration
      .update(
        { _id: id },
        { $set: { 'paiement': { 'other_captured': true, 'other': true }, 'updated': new Date(Date.now()), 'statut': 'inscrit' } },
        (err, val) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue lors du paiement')
            res.redirect('/')
          }

          // find registration update infos for redirection
          Registration
            .findById(id, (err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la validation du paiement')
                res.redirect('/inscription/recap/organisateur/' + registration.event)
              } else {
                // create notification paiement
                var notification = new Notification({
                  sender: req.user.id,
                  receiver: [registration.user],
                  message: 'Nous vous confirmons la bonne réception de votre paiement pour l\' inscription N°' + id + ' à l\'épreuve ' + registration.eventName
                })

                // save notification
                notification
                  .save((err, notification) => {
                    if (err) throw err
                    // EMAIL NOTIFICATION
                    require('../../custom_modules/app/notification/notification-email')(registration.user)
                  })

                // set headers
                req.flash('success_msg', 'Le dossier N°' + id + ' est mis à jour avec un paiement guichet (chèque / espèces) validé')

                // REDIRECTION
                res.redirect('/inscription/recap/organisateur/' + registration.event)
              }
            })
        })
  },
  // Post a checkout
  postCheckout: function (req, res) {
    var id = req.params.id
    var stripeCheckout = {
      amount: req.body.stripe,
      currency: 'eur',
      description: req.body.event,
      source: req.body.stripeToken
    }

    // STIPE
    stripe.charges.create(
      stripeCheckout,
      function (err, charge) {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/user/profil/')
        } else {
          // UPDATE registration.statut : "payé" + paiementCaptured
          Registration.update({_id: id}, {$set:
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
              res.redirect('/inscription/checkout/' + id)
            } else {
              Registration
                .find({_id: id})
                .populate('event')
                .exec((err, registration) => {
                  if (err) {
                    req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
                    res.redirect('/inscription/checkout/' + id)
                  } else {
                    // create notification paiement
                    var notification = new Notification({
                      receiver: [registration[0].user],
                      message: 'Nous vous confirmons le paiement N°' + registration[0].paiement.id + ' pour l\' inscription N°' + id + ' à l\'épreuve ' + registration[0].eventName
                    })

                    // save notification
                    notification
                      .save((err, notification) => {
                        if (err) throw err
                        // EMAIL NOTIFICATION
                        require('../../custom_modules/app/notification/notification-email')(registration[0].user)
                      })

                    // set headers
                    req.flash('success_msg', 'Votre paiement à bien été pris en compte')

                    // REDIRECTION
                    var eventConfig = registration[0].event
                    if (eventConfig.certificat_required) {
                      res.redirect('/inscription/cart/' + id + '/certificat')
                    } else {
                      res.redirect('/inscription/checkout/' + id + '/confirmation')
                    }
                  }
                })
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
      registration: function (next) {
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
        var event = {}
        var paiement = []
        var dons = []
        var inscriptions = require('../../custom_modules/app/registrationToTeam')(results.registration)

        inscriptions.forEach((val) => {
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

        event.event = results.event
        event.inscriptions = inscriptions
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
  },
  setCertificatReject: (req, res) => {
    var origine = req.headers.referer
    Registration.update({_id: req.params.id}, {
      $set: {
        'docs.certificat': '',
        'docs.certificat_validation': false,
        'organisateur_validation.certificat': false,
        'organisateur_validation.all': false,
        'updated': new Date(Date.now())
      }
    }, (err, data) => {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect(origine)
      } else {
        Registration
          .findOne({_id: req.params.id}, (err, registration) => {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue')
              res.redirect(origine)
            } else {
              var notification = new Notification({
                sender: req.user.id,
                receiver: [registration.user],
                message: 'Le certificat médicale de votre inscription N°' + registration.id + ' à ' + registration.eventName + ' vient d\'être rejeté par l\'organisateur.'
              })

              notification.save((err, notification) => {
                if (err) {
                  req.flash('error_msg', 'Une erreur est survenue')
                } else {
                  require('../../custom_modules/app/notification/notification-email')(registration.user)
                  req.flash('success_msg', 'Le dossier N°' + req.params.id + ' a été mis à jour avec un reject du certificat médical')
                }
                res.redirect(origine)
              })
            }
          })
      }
    })
  },
  setCheckoutValidate: (req, res) => {
    var origine = req.headers.referer
    Registration.update({_id: req.params.id}, {
      $set: {
        'organisateur_validation.all': true,
        'updated': new Date(Date.now())
      }
    }, (err, data) => {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect(origine)
      } else {
        Registration
          .findOne({_id: req.params.id}, (err, registration) => {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue')
              res.redirect(origine)
            } else {
              var notification = new Notification({
                sender: req.user.id,
                receiver: [registration.user],
                message: 'Votre inscription N°' + registration.id + ' à ' + registration.eventName + ' vient d\'être validée par l\'organisateur.'
              })

              notification.save((err, notification) => {
                if (err) {
                  req.flash('error_msg', 'Une erreur est survenue')
                } else {
                  require('../../custom_modules/app/notification/notification-email')(registration.user)
                  req.flash('success_msg', 'Le dossier N°' + req.params.id + ' a été mis à jour avec une validation du dossier')
                }
                res.redirect(origine)
              })
            }
          })
      }
    })
  }
}

module.exports = registrationCtrl
