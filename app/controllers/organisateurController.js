var async = require('async'),
	bodyParser = require('body-parser'),
	bcrypt = require('bcryptjs'),
	crypto = require('crypto'),
	fs = require('fs'),
	LocalStrategy = require('passport-local').Strategy,
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

//Controllers
var organsisateurCtrl = {
	// Get all épreuves
	getEpreuves : function(req, res){
		Event.find({author: req.user.id}, function (err, event) {
			var event = event
			res.render('partials/organisateurs/event-list', {event : event})
		})
	},
	// Get contact form
	getContacter : function(req, res){
		Registration.findById(req.params.id).populate('event').exec((err, data)=>{
			if(err) {
				res.render('partials/user/profil/' + req.user.id, {error : errors});
			} else {
				var data = {data}
				res.render('partials/organisateurs/contacter', data);			
			}
		})
	},
	// Post contact form
	postContacter : function(req, res){
		var event = req.body.event_id

		var mailOptions = {
			to: req.body.prenom_participant + ' ' + req.body.nom_participant + ' <' + req.body.email_participant + '>',
			bcc: req.body.event_name + ' <' + req.body.email_organisateur + '>',
			from: req.body.event_name + ' <' + req.body.email_organisateur + '>',
			subject: 'informations complémentaires ' + req.body.event_name,
			text: req.body.description
		};

		smtpTransport.sendMail(mailOptions, function(err) {
			if (err){
				req.flash('success_msg', 'Votre message a bien été envoyé à ' + req.body.prenom_participant + ' ' + req.body.nom_participant);
			}	
			req.flash('success_msg', 'Votre message a bien été envoyé à ' + req.body.prenom_participant + ' ' + req.body.nom_participant);
			res.redirect('/user/gerer/' + event);
			done(err, 'done');
		});
	},
	// Get comptabilité
	getComptabilite : function(req, res){
		res.render('partials/organisateurs/comptabilite');
	},
	//Post comptabilité
	postComptabilite : function(req, res){

		try {
			var updateUser = {
				code_etablissement : Number(req.body.code_etablissement),
				code_guichet : Number(req.body.code_guichet),
				numero_de_compte : Number(req.body.numero_de_compte),
				cle_RIB : Number(req.body.cle_RIB),
				updated: new Date()
			};
		} catch(err) {
			req.flash('error', err);
			res.redirect('/organisateur/comptabilite/' + req.user.id);
		}

		console.log(updateUser)

		User.findByIdAndUpdate(req.user.id, updateUser, function(err, user){
			if(err) {
				req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre RIB');
				res.redirect('/organisateur/comptabilite/' + req.user.id);
			} else {
				req.flash('success_msg', 'Votre RIB a été mis à jour');
				res.redirect('/user/profil/' + req.user.id +'/');			
			}
		});	

	}
}

module.exports = organsisateurCtrl;