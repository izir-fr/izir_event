var async = require('async'),
	bodyParser = require('body-parser'),
	bcrypt = require('bcryptjs'),
	crypto = require('crypto'),
	express = require('express'),
	fs = require('fs'),
	LocalStrategy = require('passport-local').Strategy,
	router = express.Router(),
	SibApiV3Sdk = require('sib-api-v3-sdk'),
	nodemailer = require('nodemailer'),
	passport = require('passport'),
	json2csv = require('json2csv');

// Credentials
var credentials = require('../config/credentials');

// Models
var	Event = require('../models/event'),
	Registration = require('../models/registration'),
	User = require('../models/user'),
	urlencodedParser = bodyParser.urlencoded({ extended: false });

//custom modules
var catList = require('../../custom_modules/lists/category-list'),
	dateList = require('../../custom_modules/lists/date-list');

var ensureAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/user/login');
	}
}

//Vue des inscriptions
router.get('/recap/:id',ensureAuthenticated, function(req, res){
	Registration.find({user: req.user.id}).populate('event').exec(function(err, registrations){
		var registrations = registrations
		res.render('partials/registration/recap', {registrations : registrations})
	})
});

//Vue gérer une épreuve
router.get('/gerer/:id', ensureAuthenticated, function(req, res){
	async.parallel({
	    event: function(next) {
	    	Event.findById(req.params.id).exec(next)
	    },
	    participants: function(next) {
	        Registration.find({event: req.params.id}).populate('user').exec(next)
	    }
	}, function(err, results) {
		var event = results
		res.render('partials/organisateurs/gerer', event);
	});	
})

//Vue gérer une épreuve
router.get('/file/excel/:id', ensureAuthenticated, function(req, res){
	async.parallel({
	    event: function(next) {
	    	Event.findById(req.params.id).exec(next)
	    },
	    participants: function(next) {
	        Registration.find({event: req.params.id}).populate('user').exec(next)
	    }
	}, function(err, results) {
		var event = results.participants

		var inscriptions = []
		event.forEach((val)=>{
			var paiement,
				certificat,
				categorie,
				cleanNaissance,
				anneeNaissance,
				moisNaissance,
				joursNaissance;

			cleanNaissance = val.participant.dateNaissance.split('/')

			if(cleanNaissance.length > 0) {
				anneeNaissance = cleanNaissance[2]
				moisNaissance = cleanNaissance[1]
				joursNaissance = cleanNaissance[0]
			} else {
				anneeNaissance = cleanNaissance
				moisNaissance = ""
				joursNaissance = ""
			}

			var courses = []
			val.produits.forEach((val)=>{
				if(val.produitsQuantite > 0 && val.produitsRef !== "don"){
					courses.push(val.produitsRef)
				}
			})

			if(val.paiement.captured === true){
				paiement = "O"
			} else {
				paiement = "N"
			}

			if(val.docs.certificat === null || val.docs.certificat === undefined || val.docs.certificat === ""){
				certificat = "N"
			}  else {
				certificat = "O"
			}
			
			if(val.participant.categorie === "EA - École d'Athlétisme" ){
				categorie = 1 //EA
			} else if (val.participant.categorie === "PO - Poussins") {
				categorie = 2 //PO
			} else if (val.participant.categorie === "BE - Benjamins") {
				categorie = 3 //BE
			} else if (val.participant.categorie === "MI - Minimes") {
				categorie = 4 //MI
			} else if (val.participant.categorie === "CA - Cadets") {
				categorie = 5 //CA
			} else if (val.participant.categorie === "JU - Juniors") {
				categorie = 6 //JU
			} else if (val.participant.categorie === "ES - Espoirs") {
				categorie = 7 //ES
			} else if (val.participant.categorie === "SE - Seniors") {
				categorie = 8 //SE
			} else if (val.participant.categorie === "V1 - Masters H et F") {
				categorie = 9 //V1
			} else if (val.participant.categorie === "V2 - Masters H et F") {
				categorie = 10 //V2
			} else if (val.participant.categorie === "V3 - Masters H et F") {
				categorie = 11 //V3
			} else if (val.participant.categorie === "V4 - Masters H et F") {
				categorie = 12 //V4
			} else if (val.participant.categorie === "V5 - Masters H et F") {
				categorie = 13 //V5
			} else if (val.participant.categorie === "VE - Masters") {
				categorie = ""	
			} else if (val.participant.categorie === "BB - Baby Athlé") {
				categorie = ""
			} else {
				categorie = ""
			}			

			inscriptions.push({
				NOM : val.participant.nom,
				PRENOM : val.participant.prenom,
				ADRESSE1 : val.participant.adresse1,
				ADRESSE2 : val.participant.adresse2,
				CODE : val.participant.codePostal,
				VILLE : val.participant.city,
				ETAT : '',
				PAYS : '',      
				EMAIL : val.participant.email,
				TEL : val.telephone,
				SEXE : val.participant.sex,
				NUMERO : '' ,
				HANDICAP : '',
				LICENCE : val.participant.numLicence,
				ANNEE_NAISSANCE : anneeNaissance,
				MOIS_NAISSANCE : moisNaissance,
				JOURS_NAISSANCE : joursNaissance,
				CATEGORIE : categorie,
				TEMPS : '',
				CLUB : val.participant.team,
				CODECLUB : '',
				ORGANISME : '',
				NATION : '',
				COURSE : courses,
				DISTANCE: val.distance,
				PAYE : paiement,
				INVITE : 'N',
				ENVOICLASST : 'N',
				'CERTIF MEDICAL' : certificat,
			})
		})

		var fields = ['NOM','PRENOM','ADRESSE1','ADRESSE2','CODE','VILLE','ETAT','PAYS','EMAIL','TEL','SEXE','NUMERO','HANDICAP','LICENCE','ANNEE_NAISSANCE','MOIS_NAISSANCE','JOURS_NAISSANCE','CATEGORIE','TEMPS','CLUB','CODECLUB','ORGANISME','NATION','COURSE','DISTANCE','PAYE','INVITE','ENVOICLASST','CERTIF MEDICAL'];

		try {
			var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del : ';', quotes : ''});
			fs.writeFile(req.params.id + '.csv', csv, 'ascii', (err) => {
				if (err) throw err;
				res.download('./' + req.params.id + '.csv');
			});		  
		} catch (err) {
			req.flash('error', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.');
	    	res.redirect('/user/gerer/' + req.user.id );
		}
	});	
})

//Vue gérer une épreuve
router.get('/file/gmcap/:id', ensureAuthenticated, function(req, res){
	async.parallel({
	    event: function(next) {
	    	Event.findById(req.params.id).exec(next)
	    },
	    participants: function(next) {
	        Registration.find({event: req.params.id}).populate('user').exec(next)
	    }
	}, function(err, results) {
		var event = results.participants

		var inscriptions = []
		event.forEach((val)=>{
			var paiement,
				certificat,
				categorie,
				cleanNaissance,
				anneeNaissance;

			cleanNaissance = val.participant.dateNaissance.split('/')

			if(cleanNaissance.length > 0) {
				anneeNaissance = cleanNaissance[2]
			} else {
				anneeNaissance = cleanNaissance
			}

			var courses = []
			val.produits.forEach((val)=>{
				if(val.produitsQuantite > 0 && val.produitsRef !== "don"){
					courses.push(val.produitsRef)
				}
			})

			if(val.paiement.captured === true){
				paiement = "O"
			} else {
				paiement = "N"
			}

			if(val.docs.certificat === null || val.docs.certificat === undefined || val.docs.certificat === ""){
				certificat = "N"
			}  else {
				certificat = "O"
			}
			
			if(val.participant.categorie === "EA - École d'Athlétisme" ){
				categorie = 1 //EA
			} else if (val.participant.categorie === "PO - Poussins") {
				categorie = 2 //PO
			} else if (val.participant.categorie === "BE - Benjamins") {
				categorie = 3 //BE
			} else if (val.participant.categorie === "MI - Minimes") {
				categorie = 4 //MI
			} else if (val.participant.categorie === "CA - Cadets") {
				categorie = 5 //CA
			} else if (val.participant.categorie === "JU - Juniors") {
				categorie = 6 //JU
			} else if (val.participant.categorie === "ES - Espoirs") {
				categorie = 7 //ES
			} else if (val.participant.categorie === "SE - Seniors") {
				categorie = 8 //SE
			} else if (val.participant.categorie === "V1 - Masters H et F") {
				categorie = 9 //V1
			} else if (val.participant.categorie === "V2 - Masters H et F") {
				categorie = 10 //V2
			} else if (val.participant.categorie === "V3 - Masters H et F") {
				categorie = 11 //V3
			} else if (val.participant.categorie === "V4 - Masters H et F") {
				categorie = 12 //V4
			} else if (val.participant.categorie === "V5 - Masters H et F") {
				categorie = 13 //V5
			} else if (val.participant.categorie === "VE - Masters") {
				categorie = ""	
			} else if (val.participant.categorie === "BB - Baby Athlé") {
				categorie = ""
			} else {
				categorie = ""
			}			

			inscriptions.push({
				NOM : val.participant.nom,
				PRENOM : val.participant.prenom,
				ADRESSE1 : val.participant.adresse1,
				ADRESSE2 : val.participant.adresse2,
				CODE : val.participant.codePostal,
				VILLE : val.participant.city,
				ETAT : '',
				PAYS : '',      
				EMAIL : val.participant.email,
				TEL : val.telephone,
				SEXE : val.participant.sex,
				NUMERO : '' ,
				HANDICAP : '',
				LICENCE : val.participant.numLicence,
				NAISSANCE : anneeNaissance,
				CATEGORIE : categorie,
				TEMPS : '',
				CLUB : val.participant.team,
				CODECLUB : '',
				ORGANISME : '',
				NATION : '',
				COURSE : courses,
				DISTANCE: val.distance,
				PAYE : paiement,
				INVITE : 'N',
				ENVOICLASST : 'N',
				'CERTIF MEDICAL' : certificat,
			})
		})

		var fields = ['NOM','PRENOM','ADRESSE1','ADRESSE2','CODE','VILLE','ETAT','PAYS','EMAIL','TEL','SEXE','NUMERO','HANDICAP','LICENCE','NAISSANCE','CATEGORIE','TEMPS','CLUB','CODECLUB','ORGANISME','NATION','COURSE','DISTANCE','PAYE','INVITE','ENVOICLASST','CERTIF MEDICAL'];

		try {
			var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del : '	', quotes : ''});
			fs.writeFile(req.params.id + '.txt', csv, 'ascii', (err) => {
				if (err) throw err;
				res.download('./' + req.params.id + '.txt');
			});		  
		} catch (err) {
			req.flash('error', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.');
	    	res.redirect('/user/gerer/' + req.user.id );
		}
	});	
})

module.exports = router;