var mongoose = require('mongoose')
var Schema = mongoose.Schema

var reqBolleanTest = require('../../middleware/app/test/reqBolleanTest')

// Event Schema
var EventSchema = mongoose.Schema({
  name: { type: String, index: true },
  author: { type: Schema.ObjectId, ref: 'User', required: true },
  adresse: {
    adresse1: { type: String },
    adresse2: { type: String },
    ville: { type: String },
    region: { type: String },
    codePostal: { type: Number },
    pays: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  description: { type: String },
  dons: { type: Boolean, default: false },
  certificat_required: { type: Boolean, default: false },
  paiement: { type: Boolean, default: true },
  paiement_cb_required: { type: Boolean, default: false },
  epreuves: [
    { type: Schema.ObjectId, ref: 'Race', required: true }
  ],
  docs: {
    img: [{ type: String }],
    legales: [{ type: String }]
  },
  options: [
    {
      reference: { type: String },
      prix: { type: Number }
    }
  ],
  date_cloture_inscription: { type: Date },
  permanence: {
    email: { type: String },
    telephone: { type: String },
    siteWeb: { type: String },
    facebook: { type: String }
  },
  chronometreur: { type: Schema.ObjectId, ref: 'User' },
  funds_repaid: { type: Boolean, default: false },
  source: { type: String },
  doublon: { type: String },
  created_at: { type: Date, required: true, default: Date.now },
  updated: { type: Date }
})

var Event = module.exports = mongoose.model('Event', EventSchema)

module.exports.createEvent = function (newEvent, callback) {
  newEvent.save(callback)
}

module.exports.getEventByName = function (name, callback) {
  var query = {name: name}
  Event.findOne(query, callback)
}

module.exports.getEventById = function (id, callback) {
  Event
    .findById(id)
    .populate('epreuves')
    .exec(callback)
}

module.exports.eventConstructor = (req, options) => {
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
    paiement_cb_required: reqBolleanTest(req.body.paiement_cb_required),
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

module.exports.optionConstructor = (req) => {
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
