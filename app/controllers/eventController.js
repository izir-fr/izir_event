var async = require('async')
var Promise = require('bluebird')

var dateNow = new Date(Date.now())

// custom modules
var catList = require('../../middleware/lists/category-list')
var dateList = require('../../middleware/lists/date-list')
var disList = require('../../middleware/lists/discipline-list')

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var Race = require('../models/race')

// event model constructor
var eventFinderForm = require('../../middleware/app/event/finder-algo')
var eventConstructor = require('../models/event').eventConstructor
var optionConstructor = require('../models/event').optionConstructor
var reqBolleanTest = require('../../middleware/app/test/reqBolleanTest')

/* ==========
START APP =>
========== */

var product = require('../models/product').productSuggestion

var getOneEvent = (eventId) => {
  return new Promise((resolve, reject) => {
    Event
      .findOne({ _id: eventId })
      .populate('epreuves')
      .exec((err, event) => {
        if (err) {
          reject(err)
        }
        resolve(event)
      })
  })
}

var searchRegistrations = (query) => {
  return new Promise((resolve, reject) => {
    Registration
      .find(query)
      .sort({ 'participant.nom': 1 })
      .exec((err, registrations) => {
        if (err) {
          reject(err)
        }
        resolve(registrations)
      })
  })
}

var getOpenRaces = (query) => {
  return new Promise((resolve, reject) => {
    async.parallel({
      event: (next) => {
        Event
          .findById(query)
          .populate('epreuves')
          .exec(next)
      },
      participants: (next) => {
        Registration.find({event: query}).exec(next)
      }
    }, (err, results) => {
      if (err) {
        reject(err)
      }

      var produisParticipant = results.participants
      var maxParticipant = results.event.epreuves
      var allProduits = []
      var uniqueProduit = []

      // Single epreuve init participants
      maxParticipant.forEach((val) => {
        var epreuve = {
          id: val._id,
          name: val.name,
          max: val.placesDispo,
          distance: val.distance,
          quantity: 0,
          tarif: val.tarif,
          active: true,
          team: val.team
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
              single.quantity++
            }
          })
        }
      })

      uniqueProduit.forEach((val) => {
        if (val.quantity >= val.max) {
          val.active = false
        }
      })

      resolve(uniqueProduit)
    })
  })
}

var eventCtrl = {
  // Get all event
  getAllEvent: (req, res) => {
    if (JSON.stringify(req.query) !== '{}') {
      eventFinderForm(req, res, (finderResult) => {
        finderResult.date_list = dateList
        finderResult.discipline_list = disList
        res.render('partials/event/finder', finderResult)
      }, (err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
      })
    } else {
      res.redirect('/event/finder?year=&city=&month=&discipline=&activate=')
    }
  },
  // Get create event page
  getCreateEvent: (req, res) => {
    var config = {
      action_text: 'Créer',
      action_url: '/event/create'
    }
    res.render('partials/event/event-form', { date_list: dateList, category_list: catList, discipline_list: disList, config: config })
  },
  // Post a create event
  postCreateEvent: (req, res) => {
    /// ///EVENT CONSTRUCTOR//////
    var options = optionConstructor(req)
    var event = eventConstructor(req, options)

    var newEvent = new Event(
      event
    )

    // AJOUT DE L'EVENT A LA BDD
    Event.createEvent(newEvent, function (err, event) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      // REDIRECTION & CONFIRMATION
      req.flash('success_msg', 'Votre évènement est ajouté au calendrier')
      res.redirect('/event/' + event.id + '/race/create')
    })
  },
  // Get a edit event page
  getEditEvent: (req, res) => {
    Event
      .findOne({_id: req.params.id})
      .exec((err, event) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }

        var config = {
          action_text: 'Modifer',
          action_url: '/event/edit/' + req.params.id,
          edit: true
        }

        var adminId = process.env.ADMIN
        var eventUserId = String(event.author)

        if (req.user.id === eventUserId || req.user.id === adminId) {
          // propriétaire ou ADMIN
          res.render('partials/event/event-form', { event: event, date_list: dateList, category_list: catList, discipline_list: disList, config: config })// si la personne est bien la propriétaire
        } else {
          res.redirect('/organisateur/epreuves')// sinon res.render('partials/event/finder')
        }
      })
  },
  // Post a edit event
  postEditEvent: (req, res) => {
    // EVENT CONSTRUCTOR
    var options = optionConstructor(req)
    var updateEvent = eventConstructor(req, options)

    // MODIFICATION DE L'EVENT DANS LA BDD
    Event.findByIdAndUpdate(req.params.id, updateEvent, function (err, user) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      // REDIRECTION & CONFIRMATION
      req.flash('success_msg', 'Votre événement est modifié avec succès')
      res.redirect('/event/' + req.params.id + '/dashboard')
    })
  },
  // Get a event
  GetSingleEvent: (req, res) => {
    var participantsQuery

    if (req.query.epreuve && req.query.epreuve !== 'Toutes') {
      participantsQuery = {
        event: req.params.id,
        $or: [
          { 'participant.nom': { $gt: [] } },
          { 'participant.prenom': { $gt: [] } },
          { 'paiement.captured': { $eq: true } },
          { 'paiement.other_captured': { $eq: true } }
        ],
        produits: { $elemMatch: { race: req.query.epreuve, produitsQuantite: { $ne: 0 } } }
      }
    } else {
      participantsQuery = {
        event: req.params.id,
        $or: [
          { 'participant.nom': { $gt: [] } },
          { 'participant.prenom': { $gt: [] } },
          { 'paiement.captured': { $eq: true } },
          { 'paiement.other_captured': { $eq: true } }
        ]
      }
    }

    Promise
      .props({
        event: getOneEvent(req.params.id),
        participants: searchRegistrations(participantsQuery),
        races: getOpenRaces(req.params.id)
      })
      .then((api) => {
        var active = new Date(api.event.date_cloture_inscription) > dateNow

        var data = {
          result: api,
          config: {
            registration: {
              active: active
            }
          }
        }
        res.render('partials/event/event-detail', data)
      })
      .catch((err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors du chargement de la page. Si l\'erreur persiste contactez le service client.')
          res.redirect('/event/' + req.params.event)
        }
      })
  },
  getCreateRace: (req, res) => {
    var config = {
      action_text: 'Ajouter',
      action_url: '/event/' + req.params.event + '/race/create'
    }

    Event
      .findById(req.params.event)
      .exec((err, event) => {
        if (err) {
          res.redirect('/event/' + req.params.event + '/dashboard')
        }
        res.render('partials/event/race-form', { race: { event: event }, date_list: dateList, category_list: catList, discipline_list: disList, config: config })
      })
  },
  postCreateRace: (req, res) => {
    var epreuve = new Race({
      name: req.body.name, // req.body.epreuveName,
      event: req.params.event,
      author: req.user._id,
      discipline: req.body.discipline, // req.body.discipline,
      description: req.body.description, // req.body.epreuveDescription,
      date_debut: new Date(Date.UTC(req.body.anneeDebut, (req.body.moisDebut - 1), req.body.jourDebut, req.body.heureDebut, req.body.minuteDebut)),
      tarif: req.body.tarif, // req.body.tarif,
      distance: req.body.distance, // req.body.distance,
      denivele: req.body.denivele, // req.body.denivele,
      placesDispo: req.body.placesDispo, // req.body.placesDispo,
      // team
      team: reqBolleanTest(req.body.team),
      team_qty_min: req.body.team_qty_min,
      team_qty_max: req.body.team_qty_max
    })

    epreuve.save((err, race) => {
      if (err) {
        res.redirect('/event/' + req.params.event + '/race/create')
      }

      Event
        .findOneAndUpdate({ _id: req.params.event }, { $push: { epreuves: [ race._id ] } }, { multi: true }, (err, updated) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue')
            res.redirect('/event/' + req.params.event + '/race/create')
          }
          req.flash('success_msg', 'Votre épreuve est ajoutée avec succès')
          res.redirect('/event/' + req.params.event + '/dashboard')
        })
    })
  },
  getEditRace: (req, res) => {
    Race
      .findOne({ _id: req.params.race })
      .populate('event')
      .exec((err, race) => {
        if (err) {
          res.redirect('/event/' + req.params.event + '/race/create')
        }
        var config = {
          action_text: 'Modifier',
          action_url: '/event/' + req.params.event + '/race/' + req.params.race + '/edit',
          edit: true
        }
        res.render('partials/event/race-form', { race: race, date_list: dateList, category_list: catList, discipline_list: disList, config: config })
      })
  },
  postEditRace: (req, res) => {
    var epreuve = {
      name: req.body.name, // req.body.epreuveName,
      event: req.params.event,
      author: req.user._id,
      discipline: req.body.discipline, // req.body.discipline,
      description: req.body.description, // req.body.epreuveDescription,
      date_debut: new Date(Date.UTC(req.body.anneeDebut, (req.body.moisDebut - 1), req.body.jourDebut, req.body.heureDebut, req.body.minuteDebut)),
      tarif: req.body.tarif, // req.body.tarif,
      distance: req.body.distance, // req.body.distance,
      denivele: req.body.denivele, // req.body.denivele,
      placesDispo: req.body.placesDispo, // req.body.placesDispo,
      // team
      team: reqBolleanTest(req.body.team),
      team_qty_min: req.body.team_qty_min,
      team_qty_max: req.body.team_qty_max
    }

    Race
      .findOneAndUpdate({ _id: req.params.race }, epreuve, (err, updated) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/event/' + req.params.event + '/race/create')
        }
        req.flash('success_msg', 'Votre épreuve est modifiée avec succès')
        res.redirect('/event/' + req.params.event + '/dashboard')
      })
  },
  getDeleteRace: (req, res) => {
    Race
      .findById(req.params.race)
      .exec((err, race) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/event/' + req.params.event + '/dashboard')
        }

        if (String(race.author) === String(req.user.id)) {
          Event
            .findOneAndUpdate({ _id: req.params.event }, { $pull: { epreuves: req.params.race } }, (err, updated) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue')
                res.redirect('/event/' + req.params.event + '/dashboard')
              }
              req.flash('success_msg', 'Votre épreuve a été supprimée avec succès')
              res.redirect('/event/' + req.params.event + '/dashboard')
            })
        } else {
          req.flash('error_msg', 'Une Vous n\'êtes pas autoriser à supprimer cet évenement')
          res.redirect('/event/' + req.params.event + '/dashboard')
        }
      })
  },
  getDashboardEvent: (req, res) => {
    Promise
      .props({
        event: getOneEvent(req.params.event),
        product: product
      })
      .then((val) => {
        res.render('partials/event/dashboard', val)
      })
      .catch((err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue')
          res.redirect('/')
        }
      })
  }
}

module.exports = eventCtrl
