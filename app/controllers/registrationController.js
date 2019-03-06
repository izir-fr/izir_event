// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')
var disList = require('../../custom_modules/lists/discipline-list')

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var Notification = require('../models/notification')

var tableauDons = (inscriptions) => {
  var tableauFinal = []
  if (inscriptions.length >= 1) {
    inscriptions.forEach((inscription) => {
      if (inscription.paiement.captured || inscription.paiement.other_captured) {
        inscription.produits.forEach((produit) => {
          if (produit.produitsRef === 'dons') {
            if (produit.produitsSubTotal > 0) {
              tableauFinal.push(produit)
            }
          }
        })
      }
    })
  }
  return tableauFinal
}

var tableauPaiements = (registrations) => {
  var tableauxFinaux = {
    dossiers: registrations,
    paiements_all: [],
    paiements_cb: [],
    total: {
      paiements_all: null,
      paiements_cb: null
    }
  }

  if (registrations.length >= 1) {
    registrations.forEach((registration) => {
      // filtre uniquement les dosssiers payés, en cb et chèques
      if (registration.paiement.captured === true || registration.paiement.other_captured === true) {
        tableauxFinaux.paiements_all.push(registration.orderAmount)
      }
      // filtre uniquement les dossiers cb
      if (registration.paiement.captured === true) {
        tableauxFinaux.paiements_cb.push(registration.orderAmount)
      }
    })
  }

  tableauxFinaux.total.paiements_all = tableauxFinaux.paiements_all.reduce((acc, curr) => {
    return acc + curr
  }, 0)
  tableauxFinaux.total.paiements_cb = tableauxFinaux.paiements_cb.reduce((acc, curr) => {
    return acc + curr
  }, 0)

  return tableauxFinaux
}

var dossiersValides = (inscriptions) => {
  var dossiers = 0
  if (inscriptions.length >= 1 && inscriptions !== undefined) {
    inscriptions.forEach((inscription) => {
      var testPaiement, testCertificat
      if (inscription.paiement.captured === true || inscription.paiement.other_captured === true) {
        testPaiement = true
      } else {
        testPaiement = false
      }

      if (inscription.docs.certificat !== '' && inscription.docs.certificat !== undefined && inscription.docs.certificat !== null) {
        testCertificat = true
      } else {
        testCertificat = false
      }

      if (testPaiement === true && testCertificat === true) {
        dossiers++
      }
    })
  }
  return dossiers
}

var registrationCtrl = {
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
        res.redirect('/inscription/' + event)
      } else if (!epreuveFormat.team && !epreuveFormat.individuel) {
        req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
        res.redirect('/inscription/' + event)
      } else {
        // ajout des produits dans la commande
        cart.epreuve.forEach((val) => {
          produits.push({
            race: val.id,
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
        registration.save((err, registration) => {
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
            res.send({ redirect: '/inscription/' + registration.id + '/participant' })
          }
        })
      }
    }
  },
  cartParticipantUpdate: (req, res) => {
    var data
    var user = req.user.id
    var birthday = {
      jour: '',
      mois: '',
      annee: ''
    }

    if (req.user.birthday !== '') {
      try {
        birthday.jour = req.user.birthday.split('/')[0]
        birthday.mois = req.user.birthday.split('/')[1]
        birthday.annee = req.user.birthday.split('/')[2]
      } catch (err) {
        birthday.jour = ''
        birthday.mois = ''
        birthday.annee = ''
      }
    }

    Registration
      .findById(req.params.registration)
      .populate('event')
      .populate('produits.race')
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du choix de l\'épreuve')
          res.redirect('/inscription/recap-user/' + user)
        }

        data = {
          results: registration,
          birthday: birthday,
          date_list: dateList,
          category_list: catList,
          discipline_list: disList
        }

        registration.produits.forEach((race) => {
          if (race.team) {
            res.redirect('/inscription/' + req.params.registration + '/team')
          }
        })

        res.render('partials/registration/step-participant', data)
      })
  },
  postParticipantUpdate: (req, res) => {
    var id = req.params.registration
    // update registration
    Registration.update(
      { _id: id },
      { $set: {
        'participant': {
          'nom': req.body.surname,
          'prenom': req.body.name,
          'email': req.body.email,
          'phone': req.body.phone,
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
          res.redirect('/inscription/' + id + '/participant')
        } else {
          Registration
            .findById(id)
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
                res.redirect('/inscription/' + id + '/participant')
              } else {
                res.redirect('/inscription/recap/user/' + req.user.id)
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
          res.redirect('/inscription/' + registration[0].event.id)
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
          res.redirect('/inscription/' + id + '/team')
        } else {
          Registration
            .find({_id: id})
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la saisie de vos informations')
                res.redirect('/inscription/' + id + '/team')
              } else {
                var eventConfig = registration[0].event
                if (eventConfig.paiement) {
                  res.redirect('/inscription/' + id)
                } else if (eventConfig.certificat_required) {
                  res.redirect('/inscription/' + id + '/certificat')
                } else {
                  res.redirect('/inscription/' + id + '/confirmation')
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
          res.redirect('/inscription/' + id + '/certificat/team')
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
          res.redirect('/inscription/' + id + '/certificat')
        } else {
          res.redirect('/inscription/recap-user/' + req.user.id)
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
        res.redirect('/inscription/' + id + '/certificat')
      })
  },
  getOtherPaiementCaptured: (req, res) => {
    var id = req.params.id

    // update registrration
    Registration
      .update(
        { _id: id },
        { $set: { 'paiement': { 'captured': true }, 'updated': new Date(Date.now()), 'statut': 'inscrit' } },
        (err, val) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue lors du paiement')
            res.redirect('/')
          }

          // find registration update infos for redirection
          Registration
            .findById(id)
            .populate('event')
            .exec((err, registration) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la validation du paiement')
                res.redirect('/inscription/recap/organisateur/' + registration.event)
              } else {
                // create notification paiement
                var notification = new Notification({
                  sender: req.user.id,
                  receiver: [registration.user],
                  message: 'Nous vous confirmons la bonne réception de votre paiement pour l\' inscription N°' + id + ' à l\'épreuve ' + registration.event.name
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
                res.redirect('/inscription/recap/organisateur/' + registration.event._id)
              }
            })
        })
  },
  // Get user all inscription recap
  getRecapUser: function (req, res) {
    Registration
      .find({ user: req.user.id })
      .sort({ created_at: -1 })
      .populate('event')
      .populate('cart')
      .populate('produits.race')
      .exec((err, registrations) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }

        var api = []

        if (registrations.length >= 1) {
          registrations.forEach((registration) => {
            var paiementRequired = false
            var cart = false
            var certificatRequired = false
            var organisateurValidation = false

            registration.config = {
              progress_bar: {
                color: 'bg-danger',
                pourcentage: 0
              }
            }

            try {
              paiementRequired = registration.event.paiement
            } catch (err) {
              if (err) {
                paiementRequired = true
              }
            }
            if (!registration.event) {
              paiementRequired = false
            }

            try {
              cart = registration.cart.paiement.captured
            } catch (err) {
              if (err) {
                cart = false
              }
            }

            try {
              certificatRequired = registration.event.certificat_required
            } catch (err) {
              if (err) {
                certificatRequired = false
              }
            }

            try {
              organisateurValidation = registration.organisateur_validation.all
            } catch (err) {
              if (err) {
                organisateurValidation = false
              }
            }

            if (paiementRequired && (registration.paiement.captured || registration.paiement.other_captured || cart)) {
              registration.config.progress_bar.pourcentage += 33
              registration.config.paiement = true
            } else if (!paiementRequired) {
              registration.config.progress_bar.pourcentage += 33
              registration.config.paiement = true
            }

            if (registration.participant.nom && registration.participant.prenom) {
              registration.config.progress_bar.pourcentage += 33
              registration.config.participant = true
            }

            if (certificatRequired && (registration.docs.certificat !== '' && registration.docs.certificat !== null && registration.docs.certificat !== undefined)) {
              registration.config.progress_bar.pourcentage += 33
              registration.config.certificat = true
            } else if (!certificatRequired) {
              registration.config.progress_bar.pourcentage += 33
              registration.config.certificat = true
            }

            if (organisateurValidation) {
              registration.config.progress_bar.pourcentage += 1
            }

            if (registration.config.progress_bar.pourcentage <= 25) {
              registration.config.progress_bar.color = 'bg-danger'
            } else if (registration.config.progress_bar.pourcentage <= 50) {
              registration.config.progress_bar.color = 'bg-warning'
            } else if (registration.config.progress_bar.pourcentage <= 75) {
              registration.config.progress_bar.color = 'bg-warning'
            } else if (registration.config.progress_bar.pourcentage < 100) {
              registration.config.progress_bar.color = 'bg-success'
            } else if (registration.config.progress_bar.pourcentage >= 100) {
              registration.config.progress_bar.color = 'bg-success'
            }

            api.push(registration)
          })
        }

        res.render('partials/registration/recap-user', { registrations: api })
      })
  },
  postDelete: (req, res) => {
    var id = req.params.registration
    var user = req.user.id
    Registration
      .findById(id)
      .exec((err, registration) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la suppression de l\'inscription')
          res.redirect('/inscription/recap/user/' + user)
        }
        if (String(registration.user) === String(user)) {
          Registration
            .deleteOne({_id: id})
            .exec((err) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue lors de la suppression de l\'inscription')
                res.redirect('/inscription/recap/user/' + user)
              }
              req.flash('success_msg', 'L\'inscription a bien été supprimée.')
              res.redirect('/inscription/recap/user/' + user)
            })
        }
      })
  },
  // Get organisateur a recap
  getRecapOrganisateur: function (req, res) {
    Event
      .findById(req.params.id)
      .populate('epreuves')
      .exec((err, event) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue, si le problème persiste merci de nous contacter à serviceclient@izir.fr')
          res.redirect('/organisateur/epreuves')
        }
        if (String(req.user.id) === String(event.author) || String(req.user.id) === String(process.env.ADMIN)) {
          var query = {
            event: req.params.id,
            $or: [ { 'participant.nom': { $gt: [] } }, { 'participant.prenom': { $gt: [] } }, { 'paiement.captured': { $eq: true } }, { 'paiement.other_captured': { $eq: true } } ]
          }

          Registration
            .find(query)
            .populate('user')
            .populate('produits.race')
            .populate('cart')
            .sort({ 'participant.nom': 1 })
            .exec((err, registrations) => {
              var search = registrations.find((query) => {
                return query.id === '5c7d006a7a368d1d7c821a41'
              })
              console.log(search.cart.products)

              var data = {}
              // construction de l'objet renvoyé à l'api
              data.event = event

              if (err) {
                req.flash('error_msg', 'Si l\'erreur persiste merci de contacter le service client')
                res.redirect('/organisateur/epreuves')
              }

              if (registrations.length >= 1) {
                // convert dossiers to inscriptions
                data.inscriptions = require('../../custom_modules/app/chronometrage').registrationToTeam(registrations)

                // calcul des dons
                data.dons = tableauDons(data.inscriptions)

                // calcul des dossiers payés
                data.paiements = tableauPaiements(registrations)

                data.dossiers_complets = dossiersValides(data.inscriptions)
              }

              if (data.inscriptions.length >= 1 && req.query !== undefined) {
                // filter init
                if (req.query.epreuve !== 'all' && req.query.epreuve !== undefined) {
                  data.inscriptions = data.inscriptions.filter((inscription) => {
                    var validation = 0
                    inscription.produits.forEach((produit) => {
                      if (produit.race !== undefined) {
                        if (String(produit.race) === String(req.query.epreuve)) {
                          validation++
                        }
                      }
                    })

                    if (validation > 0) {
                      return true
                    }
                  })
                }

                // trie les dissuer par ordre alphanétique
                if (req.query.sort === 'alpha') {
                  data.inscriptions.sort((a, b) => {
                    if (a.participant.nom !== undefined) {
                      return a.participant.nom.localeCompare(b.participant.nom)
                    }
                  })
                } else if (req.query.sort === 'date') {
                  data.inscriptions.sort((a, b) => {
                    if (a.created_at !== undefined) {
                      return new Date(b.created_at) - new Date(a.created_at)
                    }
                  })
                } else if (req.query.sort === 'certificats') {
                  data.inscriptions.sort((a, b) => {
                    if (a.docs.certificat === '' || a.docs.certificat === undefined) {
                      a.test = 1
                    } else {
                      a.test = 0
                    }
                    if (b.docs.certificat === '' || b.docs.certificat === undefined) {
                      b.test = 1
                    } else {
                      b.test = 0
                    }
                    return b.test - a.test
                  })
                } else if (req.query.sort === 'paiements') {
                  data.inscriptions.sort((a, b) => {
                    if (a.paiement.captured === true || a.paiement.other_captured === true) {
                      a.test = 1
                    } else {
                      a.test = 0
                    }
                    if (b.paiement.captured === true || b.paiement.other_captured === true) {
                      b.test = 1
                    } else {
                      b.test = 0
                    }
                    return a.test - b.test
                  })
                } else {
                  data.inscriptions.sort((a, b) => {
                    if (a.participant.nom !== undefined) {
                      return a.participant.nom.localeCompare(b.participant.nom)
                    }
                  })
                }
              }

              res.render('partials/registration/recap-organisateur', data)
            })
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
          .findOne({_id: req.params.id})
          .populate('event')
          .exec((err, registration) => {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue')
              res.redirect(origine)
            } else {
              var notification = new Notification({
                sender: req.user.id,
                registration: registration.id,
                receiver: [registration.user],
                message: 'Le certificat médicale de votre inscription N°' + registration.id + ' à ' + registration.event.name + ' vient d\'être rejeté par l\'organisateur.'
              })

              notification.save((err, notification) => {
                if (err) {
                  req.flash('error_msg', 'Une erreur est survenue')
                } else {
                  require('../../custom_modules/app/notification/notification-email')(registration.user)
                  req.flash('success_msg', 'Vous venez de refuser le certificat médical du dossier N°' + req.params.id + ', une notification a été envoyée au participant')
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
