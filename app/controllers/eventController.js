var async = require('async')
var Promise = require('bluebird')

// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')
var disList = require('../../custom_modules/lists/discipline-list')

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')
var Race = require('../models/race')
var Product = require('../models/product')

// event finder
var eventFinderForm = require('../../custom_modules/app/event/finder-algo')
/* ==========
START APP =>
========== */

/// ///OPTIONS//////
var optionConstructor = (req, res, next) => {
  var options = []
  var option
  // req.body
  var optionId = req.body.option_id
  var optionsRef = req.body.optionsRef
  var optionsPrix = req.body.optionsPrix

  // Ajout des options de l'évènement
  if (optionId !== undefined) {
    if (optionId.constructor === Array) {
      for (var i = 0; i < optionId.length; i++) {
        // config de l'option
        option = {
          reference: optionsRef[i],
          prix: optionsPrix[i]
        }
        options.push(option)
      }
    } else {
      option = {
        reference: optionsRef,
        prix: optionsPrix
      }
      options.push(option)
    }
  }
  return options
}

var reqBolleanTest = (value) => {
  if (value === 'on' || value === 'true') {
    return true
  } else {
    return false
  }
}

/// ///EVENTS//////
var eventConstructor = (req, options, res, next) => {
  var event = {
    name: req.body.name,
    author: req.user.id,
    adresse: {
      adresse1: req.body.adresse1,
      adresse2: req.body.adresse2,
      ville: req.body.ville,
      region: req.body.region,
      codePostal: req.body.codePostal,
      pays: req.body.pays,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    description: req.body.description,
    dons: reqBolleanTest(req.body.dons),
    certificat_required: reqBolleanTest(req.body.certificat_required),
    paiement: reqBolleanTest(req.body.paiement),
    docs: {
      img: req.body.img,
      legales: req.body.legales
    },
    options: options,
    date_cloture_inscription: new Date(Date.UTC(req.body.anneeCloture, (req.body.moisCloture - 1), req.body.jourCloture, req.body.heureCloture, req.body.minuteCloture)),
    permanence: {
      email: req.body.email,
      telephone: req.body.telephone,
      siteWeb: req.body.siteWeb,
      facebook: req.body.facebook
    },
    updated: new Date()
  }

  return event
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
      res.redirect('/organisateur/epreuves')
    })
  },
  // Get a event
  GetSingleEvent: (req, res) => {
    async.parallel({
      event: (next) => {
        Event
          .findById(req.params.id)
          .populate('epreuves')
          .exec(next)
      },
      participants: (next) => {
        if (req.query.epreuve && req.query.epreuve !== 'Toutes') {
          Registration
            .find({
              event: req.params.id,
              $or: [ { 'participant.nom': { $gt: [] } }, { 'participant.prenom': { $gt: [] } }, { 'paiement.captured': { $eq: true } }, { 'paiement.other_captured': { $eq: true } } ],
              produits: { $elemMatch: { race: req.query.epreuve, produitsQuantite: { $ne: 0 } } }
            })
            .sort({ 'participant.nom': 1 })
            .exec(next)
        } else {
          Registration
            .find({
              event: req.params.id,
              $or: [ { 'participant.nom': { $gt: [] } }, { 'participant.prenom': { $gt: [] } }, { 'paiement.captured': { $eq: true } }, { 'paiement.other_captured': { $eq: true } } ]
            })
            .sort({ 'participant.nom': 1 })
            .exec(next)
        }
      }
    }, (err, result) => {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      var data = {result: result}
      res.render('partials/event/event-detail', data)
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
    var jourDebut = req.body.jourDebut
    var moisDebut = req.body.moisDebut
    var anneeDebut = req.body.anneeDebut
    var heureDebut = req.body.heureDebut
    var minuteDebut = req.body.minuteDebut

    var epreuve = new Race({
      name: req.body.name, // req.body.epreuveName,
      event: req.params.event,
      author: req.user._id,
      discipline: req.body.discipline, // req.body.discipline,
      description: req.body.description, // req.body.epreuveDescription,
      date_debut: new Date(Date.UTC(anneeDebut, (moisDebut - 1), jourDebut, heureDebut, minuteDebut)),
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
    var jourDebut = req.body.jourDebut
    var moisDebut = req.body.moisDebut
    var anneeDebut = req.body.anneeDebut
    var heureDebut = req.body.heureDebut
    var minuteDebut = req.body.minuteDebut

    var epreuve = {
      name: req.body.name, // req.body.epreuveName,
      event: req.params.event,
      author: req.user._id,
      discipline: req.body.discipline, // req.body.discipline,
      description: req.body.description, // req.body.epreuveDescription,
      date_debut: new Date(Date.UTC(anneeDebut, (moisDebut - 1), jourDebut, heureDebut, minuteDebut)),
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
    var events = new Promise((resolve, reject) => {
      Event
        .findOne({ _id: req.params.event })
        .populate('epreuves')
        .exec((err, event) => {
          if (err) {
            reject(err)
          }
          resolve(event)
        })
    })

    var product = new Promise((resolve, reject) => {
      Product
        .find({ featured: true, published: true })
        .limit(1)
        .exec((err, product) => {
          if (err) {
            reject(err)
          }
          resolve(product[0])
        })
    })

    Promise
      .props({
        event: events,
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
