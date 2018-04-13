var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Event Schema
var registrationSchema = mongoose.Schema({
	user: { type: Schema.ObjectId, ref:'User', required: true },
	event : { type: Schema.ObjectId, ref:'Event', required: true },
	eventName : { type: String },
	participant : {
		nom : { type: String },
		prenom : { type: String },
		email : { type: String },
		sex : { type: String },
		dateNaissance:{ type: String } ,
		team : { type: String },
		numLicence : { type: String },
		categorie : { type: String }, 
		/*adresse : {
			adresse1 : { type: String },
			adresse2 : { type: String },
			codePostal : { type: String },
			city : { type: String } 
		},*/
		adresse1 : { type: String },
		adresse2 : { type: String },
		codePostal : { type: String },
		city : { type: String } 
	},
	produits: [
		{
			produitsRef : { type: String },
			produitsPrix : { type: Number },
			produitsQuantite : { type: Number },
			produitsSubTotal : { type: Number }
		}
	],
	orderAmount: { type: Number },
	statut: { type: String },
	docs : {
		certificat: { type: String },
		certificat_validation : { type : Boolean, default: true },
		accord_parentale: { type: String }
	},
	paiement: {
		amount : { type: String },
		id : { type: String },
		object : { type: String },
		date : { type: Number },
		captured : { type : Boolean, default: false },
		other : { type : Boolean, default: false },
		other_captured : { type : Boolean, default: false }
	},
	created_at : { type: Date, required: true, default: Date.now },
	updated: { type: Date }
});

var Registration = module.exports = mongoose.model('Registration', registrationSchema);