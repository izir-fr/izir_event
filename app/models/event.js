var mongoose = require('mongoose')
var Schema = mongoose.Schema

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
  epreuves: [
    {
      name: { type: String },
      discipline: { type: String },
      description: { type: String },
      /*
      dateDebut : {
        jourDebut: { type: Number },
        moisDebut: { type: Number },
        anneeDebut: { type: Number },
        heureDebut: { type: Number },
        minuteDebut: { type: Number }
      },
      */
      tarif: { type: Number },
      distance: { type: Number },
      denivele: { type: Number },
      placesDispo: { type: Number },
      date_debut: { type: Date },
      // team
      team: { type: Boolean },
      team_qty_min: { type: Number },
      team_qty_max: { type: Number }
    }
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
  /*
  inscriptionCloture : {
    jourCloture: { type: Number },
    moisCloture: { type: Number },
    anneeCloture: { type: Number },
    heureCloture: { type: Number },
    minuteCloture: { type: Number }
  },
  */
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
  Event.findById(id, callback)
}
