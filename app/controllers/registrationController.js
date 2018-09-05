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

    // some check
    if (!user) {
      // res.contentType('json')
      res.send({error_msg: 'Not logged user'})
    } else if (!event) {
      // res.contentType('json')
      res.send({error_msg: 'No event reconized'})
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
        statut: 'pré-inscrit',
        updated: new Date()
      })

      // enregistrement de la pré-commande
      registration.save(function (err, registration) {
        if (err) {
          res.send({error_msg: 'Une erreur est survenue lors de l\'enregistrement de votre inscription'})
        } else {
          res.send({redirect: '/inscription/cart/'+ registration.id + '/participant'})
        }
      })
    }
  },
  cartParticipantUpdate: (req, res) => {
    var data
    var jourNaissance
    var moisNaissance
    var anneeNaissance
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
        data = {
          results: registration[0],
          jourNaissance: jourNaissance,
          moisNaissance: moisNaissance,
          anneeNaissance: anneeNaissance,
          date_list: dateList,
          category_list: catList,
          discipline_list: disList
        }
        res.render('partials/registration/step-participant', data)
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
    Registration
      .find({_id: id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
        }
        var data = {results: registration[0]}
        res.render('partials/registration/step-certificat', data)
      })
  },
  postCertificat: (req, res) => {
    var id = req.params.id
    // update registration
    Registration.update(
      { _id: id },
      { $set: {
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
  getConfirmation: (req, res) => {
    var confirmationRegistration


    var id = req.params.id
    Registration
      .find({_id: id})
      .populate('event')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page')
        }


        /*
        some validation check
        */

        var data = {
          results: registration[0], 
          confirmationRegistration: confirmationRegistration
        }
        res.render('partials/registration/step-confirmation', data)
      })
  },
  postAjaxPreinscription: function (req, res) {
    var registration, mailOptions
    var produits = []
    var team = []
    var form = req.body
    var data = form.data
    var cart = data.cart
    var participant = data.participant
    var dataTeam = data.team.membres
    var options = form.option
    var user = req.user._id
    var event = req.params.id

    // some check
    if (!user) {
      // res.contentType('json')
      res.send({error_msg: 'Not logged user'})
    } else if (!event) {
      // res.contentType('json')
      res.send({error_msg: 'No event reconized'})
    } else {
      // ajout des produits dans la commande
      cart.epreuve.forEach((val) => {
        produits.push({
          produitsRef: val.produit,
          produitsPrix: val.qty,
          produitsQuantite: val.price,
          produitsSubTotal: val.subTotal
        })
      })

      // ajout des options à la commande
      if (cart.options.length >= 1) {
        cart.options.forEach((val) => {
          produits.push({
            produitsRef: val.produit,
            produitsPrix: val.qty,
            produitsQuantite: val.price,
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

      // si team ajout des membres
      if (dataTeam) {
        dataTeam.forEach((val) => {
          team.push({
            nom: val.nom,
            prenom: val.prenom,
            sex: val.sex,
            dateNaissance: val.jourNaissance + '/' + val.moisNaissance + '/' + val.anneeNaissance,
            team: val.team,
            numLicence: val.numLicense,
            email: val.email,
            docs: {
              certificat: val.certificat
            }
          })
        })
      }

      // création de la pré-commande single
      if (options.epreuve_format.individuel === true && options.epreuve_format.team === false) {
        registration = new Registration({
          user: user, // user
          event: event, // event
          eventName: participant.event,
          participant: {
            nom: participant.nom,
            prenom: participant.prenom,
            email: participant.email,
            sex: participant.sex,
            dateNaissance: participant.jourNaissance + '/' + participant.moisNaissance + '/' + participant.anneeNaissance,
            team: participant.team,
            numLicence: participant.numLicence,
            categorie: participant.categorie,
            adresse1: participant.adresse1,
            adresse2: participant.adresse2,
            codePostal: participant.codePostal,
            city: participant.city
          },
          produits: produits,
          orderAmount: cart.totalCart,
          statut: 'pré-inscrit',
          docs: {
            certificat: participant.certificat
          },
          updated: new Date()
        })

        // enregistrement de la pré-commande
        registration.save(function (err, registration) {
          if (err) {
            res.send({error_msg: 'Une erreur est survenue lors de l\'enregistrement de votre inscription'})
          } else {
            mailOptions = {
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
            smtpTransport.sendMail(mailOptions, (mailErr) => {
              if (mailErr) throw mailErr
            })
            // res.send(form)
            // req.flash('success_msg', 'Vos informations d\'inscription ont bien été prises en compte')
            res.send({redirect: '/inscription/checkout/' + registration.id})
          }
        })
      } else if (options.epreuve_format.individuel === false && options.epreuve_format.team === true) {
        registration = new Registration({
          user: user, // user
          event: event, // event
          eventName: dataTeam[0].event,
          participant: {
            nom: data.team.capitaine.nom,
            prenom: data.team.capitaine.prenom,
            email: data.team.capitaine.email,
            team: data.team.name,
            codePostal: data.team.capitaine.codePostal,
            city: data.team.capitaine.city
          },
          team: team,
          produits: produits,
          orderAmount: cart.totalCart,
          statut: 'pré-inscrit',
          updated: new Date()
        })

        // enregistrement de la pré-commande
        registration.save(function (err, registration) {
          if (err) {
            res.send({error_msg: 'Une erreur est survenue lors de l\'enregistrement de votre inscription'})
          } else {
            mailOptions = {
              to: registration.participant.email,
              from: 'Event Izir <event@izir.fr>',
              subject: 'Récapitulatif d\'inscription N°' + registration.id,
              text: 'Bonjour,\n\n' +
              'vous venez de saisir les informations suivantes pour vous inscrire à l\'épreuve ' + registration.eventName + ' .\n\n' +
              'Voici les informations sur l\'équipe qui sont transmises à l\'organisateur : \n\n' +
              'Nom de l\'équipe :' +
              ' - Team : ' + registration.participant.team + '.\n' +
              'Capitaine:' +
              ' - Nom : ' + registration.participant.nom + '.\n' +
              ' - Prénom : ' + registration.participant.prenom + '.\n' +
              ' - Email : ' + registration.participant.email + '.\n\n' +
              ' - Adresse : ' + registration.participant.codePostal + ' ' + registration.participant.city + '.\n\n' +
              'Pour valider votre inscription, si ce n\'est déjà fait, n\'oubliez pas d\'effectuer votre règlement en ligne en suivant ce lien http://event.izir.fr/inscription/checkout/' + registration.id + '\n\n' +
              'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + req.user.id + '\n\n' +
              'Bonne course !\n\n' +
              'Nicolas de izir.fr'
            }
            // envoie du mail
            smtpTransport.sendMail(mailOptions, (mailErr) => {
              if (mailErr) throw mailErr
            })
            // res.send(form)
            // req.flash('success_msg', 'Vos informations d\'inscription ont bien été prises en compte')
            res.send({redirect: '/inscription/checkout/' + registration.id})
          }
        })
      } else {
        res.send({error_msg: 'format error'})
      }
    }
  },
  // Get checkout form
  getCheckout: function (req, res) {
    Registration
      .find({_id: req.params.id})
      .populate('event')
      .exec(function (err, registration) {
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
          results: registration[0]
        }

        console.log(data)

        res.render('partials/registration/step-checkout', data)
      })
  },
  getOtherPaiement: function (req, res) {
    var id = req.params.id
    // do somthings
    Registration.update(
      { _id: id },
      { $set: 
        {
          'paiement': { 'other': true },
          'updated': new Date(Date.now())
        }
      },
      function (err, user) {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du paiement')
          res.redirect('/inscription/checkout/' + id)
        } else {
          Registration.find({_id: id}).populate('event').exec(function (err, registrations) {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue lors de l\'envoie du mail de confirmation')
              res.redirect('/inscription/checkout/' + id)
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
            // EMAIL NOTIFICATION
              var mailOptions = {
                to: req.user.email,
                from: 'Event Izir <event@izir.fr>',
                subject: 'Confirmation de paiement et de validation de l\'inscription N° ' + id,
                text: 'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte et que votre inscription N°' + id + ' est validée. \n\n' +
                  'Vous venez donc de finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + req.body.event + '.\n\n' +
                  'Vous pouvez à tout moment consulter le statut de vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + req.user.id + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
              }
              smtpTransport.sendMail(mailOptions, (err) => {
                if (err) throw err
              })

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
  }
}

module.exports = registrationCtrl
