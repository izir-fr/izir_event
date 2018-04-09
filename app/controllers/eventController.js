var async = require('async'),
	bodyParser = require('body-parser'),
	Promise = require('bluebird'),
	fs = require("fs"),
	LocalStrategy = require('passport-local').Strategy,
	mongoose = require('mongoose'),
	nodemailer = require('nodemailer'),
	path = require('path'),
	request = require("request"),
	urlencodedParser = bodyParser.urlencoded({ extended: false });

// custom modules
var catList = require('../../custom_modules/lists/category-list'),
	dateList = require('../../custom_modules/lists/date-list'),
	disList = require('../../custom_modules/lists/discipline-list');
var dateDisplayer = require('../../custom_modules/app/router/dateDisplayer');

// Models
var Event = require('../models/event');
var Registration = require('../models/registration');
var User = require('../models/user');

//Date
var dateNow = new Date(Date.now())

/*==========
START APP =>
==========*/

//////EPREUVES//////
function epreuveConstructor(req, res, next) {
	
	var epreuves = [],
		epreuve,
		//req.body
		name = req.body.epreuveName,
		discipline = req.body.discipline,
		description = req.body.epreuveDescription,
		jourDebut = req.body.jourDebut,
		moisDebut = req.body.moisDebut,
		anneeDebut = req.body.anneeDebut,
		heureDebut = req.body.heureDebut,
		minuteDebut = req.body.minuteDebut,		
		tarif = req.body.tarif,
		distance = req.body.distance,
		denivele = req.body.denivele,
		placesDispo = req.body.placesDispo,
		epreuveId = req.body.epreuve_id;
		
	//Ajout de l'épreuve de l'évènement
	if(epreuveId.constructor === Array) {		
		for(var i = 0; i < epreuveId.length; i++) {
			//config de l'épreuve
			epreuve = {
				name : name[i], //req.body.epreuveName,
				discipline : discipline[i], //req.body.discipline,
				description : description[i], //req.body.epreuveDescription,
				date_debut : new Date(Date.UTC(anneeDebut[i], (moisDebut[i] - 1 ), jourDebut[i] , heureDebut[i], minuteDebut[i])),		
				tarif : tarif[i], //req.body.tarif,
				distance : distance[i], //req.body.distance,
				denivele : denivele[i], //req.body.denivele,
				placesDispo : placesDispo[i], //req.body.placesDispo,
			}	
			epreuves.push(epreuve)
		}
	} else {
		//config de l'épreuve
		epreuve = 		{
			name : name, //req.body.epreuveName,
			discipline : discipline, //req.body.discipline,
			description : description, //req.body.epreuveDescription,
			date_debut : new Date(Date.UTC(anneeDebut, (moisDebut - 1 ), jourDebut , heureDebut, minuteDebut)),		
			tarif : tarif, //req.body.tarif,
			distance : distance, //req.body.distance,
			denivele : denivele, //req.body.denivele,
			placesDispo : placesDispo, //req.body.placesDispo,
		}	
		epreuves.push(epreuve)
	}
	return epreuves
}

//////OPTIONS//////
function optionConstructor(req, res, next){
	
	var options = [],
		option,
		//req.body
		optionId = req.body.option_id,
		optionsRef = req.body.optionsRef,
		optionsPrix = req.body.optionsPrix;
		
	//Ajout des options de l'évènement
	if(optionId !== undefined){
		if(optionId.constructor === Array) {		
			for(var i = 0; i < optionId.length; i++) {
				//config de l'option
				option = {
					reference : optionsRef[i], 
					prix : optionsPrix[i], 
				}
				options.push(option)
			}
		} else {
			option = {
					reference : optionsRef, 
					prix : optionsPrix, 
				}
			options.push(option)
		}
	}
	return options
}

//////EVENTS//////
function eventConstructor(req, epreuves, options, res, next){
	var epreuves = epreuves,
	options = options,
	event =	{
		name: req.body.name,
		author: req.user.id,
		adresse : {
			adresse1: req.body.adresse1,
			adresse2: req.body.adresse2,
			ville: req.body.ville,
			region: req.body.region,
			codePostal: req.body.codePostal,
			pays: req.body.pays,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
		},
		description: req.body.description,
		dons : req.body.dons,
		certificat_required : req.body.certificat_required,
		paiement : req.body.paiement,
		epreuves : epreuves,
		docs : {
			img: req.body.img,
			legales: req.body.legales,
		},
		options : options,
		date_cloture_inscription : new Date(Date.UTC(req.body.anneeCloture, (req.body.moisCloture - 1 ) , req.body.jourCloture, req.body.heureCloture, req.body.minuteCloture)),
		permanence :{
			email: req.body.email,
			telephone: req.body.telephone,
			siteWeb: req.body.siteWeb,
			facebook: req.body.facebook,
		},
		updated: new Date()
	}

	return event
}

var eventCtrl = {
	// Get all event
	getAllEvent : (req, res) => {
		var allEvents = [],
			apisData,
			apis = [
						{url : 'https://jn-prod.github.io/node_scrapper/exports_files/details/tri_details.json',
						discipline : 'Triathlon'},
						{url : 'https://jn-prod.github.io/node_scrapper/exports_files/details/vtt_details.json',
						discipline : 'VTT'},
						{url : 'https://jn-prod.github.io/node_scrapper/exports_files/details/athle_details.json',
						discipline : 'Running'}
					]

		//api call
		var loadJsonSync = (element)=>{
			return new Promise((resolve, reject)=>{
				try  {	
					request(element.url, (err, res, data ) => {
						var data = JSON.parse(data)
						var results = {
							event: data,
							discipline : element.discipline
						}
						resolve(results)
					})
				}catch (err) { reject(err)}
			})
		}
		
		var api1 = loadJsonSync(apis[0]),
			api2 = loadJsonSync(apis[1]),
			api3 = loadJsonSync(apis[2])

		Promise
			.all([api1, api2,api3])
			.then((res)=>{
				var allItems = []
				res.forEach((val)=>{
					var items = val.event
					var discipline = val.discipline
					items.forEach((val)=>{
						if( val.eventName !== '' || val.name !== undefined ){
							var tarif

							if(val.prixPublic === '' || val.prixPublic === null){
								tarif = 'NC'
							} else {
								tarif = val.prixPublic
							}

							var item = {				
							    name: val.eventName,
							    description: val.description,
							    epreuves: 
								    [ {
							            tarif: tarif,
							            discipline: discipline ,
							            name: val.eventName,
							            date_debut: new Date ( Date.UTC( val.date.split('/')[2], val.date.split('/')[1] - 1 , val.date.split('/')[0] ) ),
							            source : "externe"
							        } ],
						   		adresse: {
									ville: val.lieu
						       	},
							    source : "externe"
						   	}

						   	if(item.epreuves[0].date_debut > dateNow){
						   		allItems.push(item)	
						   	}				
						}
					})
				})	
				return allItems
			})
			.then((json)=>{			
				async.parallel({
				    event: (next) => {
				    	Event.find( { epreuves : { $elemMatch : { date_debut : { $gte: dateNow } } } } ).exec(next)
				    },
				    participants: (next) => {
				        Registration.find().exec(next)
				    }
				}, (err, results) => {
					var eventFromIzir = results.event

					eventFromIzir.forEach((val)=>{
						allEvents.push(val)
					})

					json.forEach((val)=>{
						var event = val.name
						var doublon = (val)=>{
							if (val.doublon !== undefined){
								var test = val.doublon
							return test.toLowerCase() === event.toLowerCase()								
							}
						}
						var search = allEvents.find(doublon)

						if(search === undefined){
							allEvents.push(val)					
						}
					})

					allEvents.sort(function(a, b){
						return a.epreuves[0].date_debut - b.epreuves[0].date_debut
					})

					var data = {
						data: {
							event: allEvents,
							participants : results.participants
						},
						date_list : dateList,
						discipline_list : disList
					}

					res.render('partials/event/finder', data);				
				})
		});
	},
	// Get create event page
	getCreateEvent : function(req, res){
		var user = req.user
		res.render('partials/event/create-event', { date_list : dateList, category_list : catList, discipline_list : disList });
	},
	// Post a create event
	postCreateEvent : function(req, res){
		//////EVENT CONSTRUCTOR//////
		var epreuves = epreuveConstructor(req)
		var options = optionConstructor(req)
		var event = eventConstructor(req, epreuves, options)

		var newEvent = new Event(
			event
		)	
		//console.log(newEvent)

		//AJOUT DE L'EVENT A LA BDD
		Event.createEvent(newEvent, function(err, user){
			if(err) throw err;
			//REDIRECTION & CONFIRMATION
			req.flash('success_msg', 'Votre évènement est ajouté au calendrier');
			res.redirect('/organisateur/epreuves')
		});

	},
	// Get a edit event page
	getEditEvent : function(req, res){
		Event.findOne({_id: req.params.id}, function (err, event) {
			var event = event
			var adminId = process.env.ADMIN
			var eventUserId = String(event.author)

			if (req.user.id === eventUserId || req.user.id === adminId) { //propriétaire ou ADMIN
				res.render('partials/event/edit-event', {event : event, date_list : dateList, category_list : catList, discipline_list : disList})//si la personne est bien la propriétaire
			} else {
				res.redirect('/organisateur/epreuves')//sinon res.render('partials/event/finder')
			}
		})
	},
	// Post a edit event
	postEditEvent : function(req, res){
		//EVENT CONSTRUCTOR
		var epreuves = epreuveConstructor(req)
		var options = optionConstructor(req)
		var updateEvent = eventConstructor(req, epreuves, options)
		//console.log(updateEvent)
		
		//MODIFICATION DE L'EVENT DANS LA BDD
		Event.findByIdAndUpdate(req.params.id, updateEvent, function(err, user){
			if(err) throw err;
			//REDIRECTION & CONFIRMATION
			req.flash('success_msg', 'Votre épreuve est modifié avec succès');
			res.redirect('/organisateur/epreuves');		
		});
	},
	// Get a event
	GetSingleEvent : function(req, res){
		async.parallel({
		    event: function(next) {
		    	Event.findById(req.params.id).exec(next)
		    },
		    participants: function(next) {
		        Registration.find({event: req.params.id}).populate('user').exec(next)
		    }
		}, function(err, result) {
			res.render('partials/event/event-detail', {result : result});
		});	
	}
}

module.exports = eventCtrl;