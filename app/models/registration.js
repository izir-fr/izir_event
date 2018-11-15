var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Event Schema
var registrationSchema = mongoose.Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  event: { type: Schema.ObjectId, ref: 'Event', required: true },
  eventName: { type: String },
  participant: {
    nom: { type: String },
    prenom: { type: String },
    email: { type: String },
    phone: { type: String },
    sex: { type: String },
    dateNaissance: { type: String },
    team: { type: String },
    numLicence: { type: String },
    categorie: { type: String },
    adresse1: { type: String },
    adresse2: { type: String },
    codePostal: { type: String },
    city: { type: String }
  },
  team: [
    {
      nom: { type: String },
      prenom: { type: String },
      sex: { type: String },
      dateNaissance: { type: String },
      team: { type: String },
      numLicence: { type: String },
      email: { type: String },
      docs: {
        certificat: { type: String },
        certificat_validation: { type: Boolean, default: true },
        accord_parentale: { type: String }
      }
    }
  ],
  produits: [
    {
      produitsRef: { type: String },
      produitsPrix: { type: Number },
      produitsQuantite: { type: Number },
      produitsSubTotal: { type: Number }
    }
  ],
  orderAmount: { type: Number },
  statut: { type: String },
  docs: {
    certificat: { type: String },
    certificat_validation: { type: Boolean, default: true },
    accord_parentale: { type: String }
  },
  paiement: {
    amount: { type: String },
    id: { type: String },
    object: { type: String },
    date: { type: Number },
    captured: { type: Boolean, default: false },
    other: { type: Boolean, default: false },
    other_captured: { type: Boolean, default: false }
  },
  organisateur_validation: {
    participant: { type: Boolean, default: true },
    team: { type: Boolean, default: true },
    paiement: { type: Boolean, default: true },
    certificat: { type: Boolean, default: true },
    all: { type: Boolean, default: false }
  },
  options: {
    epreuve_format: {
      team: { type: Boolean, default: false },
      individuel: { type: Boolean, default: false }
    },
    team_limits: {
      min: { type: Number, default: null },
      max: { type: Number, default: null }
    }
  },
  created_at: { type: Date, required: true, default: Date.now },
  updated: { type: Date }
})

module.exports = mongoose.model('Registration', registrationSchema)
