var async = require('async')

// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')
var disList = require('../../custom_modules/lists/discipline-list')

// Models
var Event = require('../models/event')
var Registration = require('../models/registration')

// Date
var dateNow = new Date(Date.now())

/* ==========
START APP =>
========== */

/// ///EPREUVES//////
var epreuveConstructor = (req, res, next) => {
  var epreuves = []
  var epreuve
  // req.body
  var name = req.body.epreuveName
  var discipline = req.body.discipline
  var description = req.body.epreuveDescription
  var jourDebut = req.body.jourDebut
  var moisDebut = req.body.moisDebut
  var anneeDebut = req.body.anneeDebut
  var heureDebut = req.body.heureDebut
  var minuteDebut = req.body.minuteDebut
  var tarif = req.body.tarif
  var distance = req.body.distance
  var denivele = req.body.denivele
  var placesDispo = req.body.placesDispo
  var epreuveId = req.body.epreuve_id
  var team = req.body.team
  var teamQtyMin = req.body.team_qty_min
  var teamQtyMax = req.body.team_qty_max

  // Ajout de l'épreuve de l'évènement
  if (epreuveId.constructor === Array) {
    for (var i = 0; i < epreuveId.length; i++) {
      // config de l'épreuve
      epreuve = {
        name: name[i], // req.body.epreuveName,
        discipline: discipline[i], // req.body.discipline,
        description: description[i], // req.body.epreuveDescription,
        date_debut: new Date(Date.UTC(anneeDebut[i], (moisDebut[i] - 1), jourDebut[i], heureDebut[i], minuteDebut[i])),
        tarif: tarif[i], // req.body.tarif,
        distance: distance[i], // req.body.distance,
        denivele: denivele[i], // req.body.denivele,
        placesDispo: placesDispo[i], // req.body.placesDispo,
        // team
        team: reqBolleanTest(team[i]),
        team_qty_min: teamQtyMin[i],
        team_qty_max: teamQtyMax[i]
      }
      epreuves.push(epreuve)
    }
  } else {
    // config de l'épreuve
    epreuve = {
      name: name, // req.body.epreuveName,
      discipline: discipline, // req.body.discipline,
      description: description, // req.body.epreuveDescription,
      date_debut: new Date(Date.UTC(anneeDebut, (moisDebut - 1), jourDebut, heureDebut, minuteDebut)),
      tarif: tarif, // req.body.tarif,
      distance: distance, // req.body.distance,
      denivele: denivele, // req.body.denivele,
      placesDispo: placesDispo, // req.body.placesDispo,
      // team
      team: reqBolleanTest(team),
      team_qty_min: teamQtyMin,
      team_qty_max: teamQtyMax
    }
    epreuves.push(epreuve)
  }
  return epreuves
}

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
var eventConstructor = (req, epreuves, options, res, next) => {
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
    epreuves: epreuves,
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

// event finder
var eventFinderForm = (req, res) => {
  var allEvents = []
  var discipline = req.query.discipline
  var date = {
    month: req.query.month,
    year: req.query.year,
    day: 1
  }

  // var activate = req.query.activate
  var queryDate, queryDiscipline, citySearch

  if (date.year === '') {
    date.year = dateNow.getFullYear()
  }

  if (date.month === '') {
    date.month = dateNow.getMonth()
    date.day = dateNow.getDate()
  } else {
    date.month = (date.month * 1) - 1
  }

  // date query
  queryDate = { date_debut: { $gte: new Date(date.year, date.month, date.day), $lt: new Date(date.year + 1, date.month, date.day) } }
  // city query
  if (req.query.city) {
    citySearch = req.query.city.toLowerCase()
  } else {
    citySearch = ''
  }

  // discipline query
  if (discipline !== '') {
    queryDiscipline = { $eq: discipline }
  } else {
    queryDiscipline = { $ne: '' }
  }

  Event
    .find({
      $and: [
        { epreuves: { $elemMatch: queryDate } },
        { 'epreuves.discipline': queryDiscipline }
      ]
    })
    .sort({ 'epreuves.0.date_debut': 1 })
    .exec((err, results) => {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }

      // city filter
      if (results !== undefined) {
        if (citySearch !== '' || citySearch !== null) {
          results.forEach((val) => {
            // city query filter
            if (val.adresse.ville) {
              if (val.adresse.ville.toLowerCase().indexOf(citySearch) !== -1) {
                allEvents.push(val)
              }
            }
          })
        } else {
          allEvents = results
        }
      }

      var finderResult = {
        data: {
          event: allEvents
        },
        date_list: dateList,
        discipline_list: disList,
        queries: req.query
      }

      res.render('partials/event/finder', finderResult)
    })
}

var eventCtrl = {
  // Get all event
  getAllEvent: (req, res) => {
    if (JSON.stringify(req.query) !== '{}') {
      eventFinderForm(req, res)
    } else {
      res.redirect('/event/finder?year=&city=&month=&discipline=&activate=')
    }
  },
  // Get create event page
  getCreateEvent: function (req, res) {
    res.render('partials/event/create-event', { date_list: dateList, category_list: catList, discipline_list: disList })
  },
  // Post a create event
  postCreateEvent: function (req, res) {
    /// ///EVENT CONSTRUCTOR//////
    var epreuves = epreuveConstructor(req)
    var options = optionConstructor(req)
    var event = eventConstructor(req, epreuves, options)

    var newEvent = new Event(
      event
    )

    // AJOUT DE L'EVENT A LA BDD
    Event.createEvent(newEvent, function (err, user) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      // REDIRECTION & CONFIRMATION
      req.flash('success_msg', 'Votre évènement est ajouté au calendrier')
      res.redirect('/organisateur/epreuves')
    })
  },
  // Get a edit event page
  getEditEvent: function (req, res) {
    Event.findOne({_id: req.params.id}, function (err, event) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      var adminId = process.env.ADMIN
      var eventUserId = String(event.author)

      if (req.user.id === eventUserId || req.user.id === adminId) { // propriétaire ou ADMIN
        res.render('partials/event/edit-event', {event: event, date_list: dateList, category_list: catList, discipline_list: disList})// si la personne est bien la propriétaire
      } else {
        res.redirect('/organisateur/epreuves')// sinon res.render('partials/event/finder')
      }
    })
  },
  // Post a edit event
  postEditEvent: function (req, res) {
    // EVENT CONSTRUCTOR
    var epreuves = epreuveConstructor(req)
    var options = optionConstructor(req)
    var updateEvent = eventConstructor(req, epreuves, options)

    // MODIFICATION DE L'EVENT DANS LA BDD
    Event.findByIdAndUpdate(req.params.id, updateEvent, function (err, user) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      // REDIRECTION & CONFIRMATION
      req.flash('success_msg', 'Votre épreuve est modifié avec succès')
      res.redirect('/organisateur/epreuves')
    })
  },
  // Get a event
  GetSingleEvent: function (req, res) {
    async.parallel({
      event: function (next) {
        Event.findById(req.params.id).exec(next)
      },
      participants: function (next) {
        if (req.query.epreuve && req.query.epreuve !== 'Toutes') {
          Registration
            .find({
              event: req.params.id,
              $or: [ { 'participant.nom': { $gt: [] } }, { 'participant.prenom': { $gt: [] } }, { 'paiement.captured': { $eq: true } }, { 'paiement.other_captured': { $eq: true } } ],
              produits: { $elemMatch: { produitsRef: req.query.epreuve, produitsQuantite: { $ne: 0 } } }
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
    }, function (err, result) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue')
        res.redirect('/')
      }
      var data = {result: result}
      res.render('partials/event/event-detail', data)
    })
  }
}

module.exports = eventCtrl
