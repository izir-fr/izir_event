var async = require('async'),
	bodyParser = require('body-parser'),
	Promise = require('bluebird'),
	express = require('express'),
	fs = require("fs"),
	router = express.Router(),
	LocalStrategy = require('passport-local').Strategy,
	mongoose = require('mongoose'),
	nodemailer = require('nodemailer'),
	path = require('path'),
	request = require("request"),
	urlencodedParser = bodyParser.urlencoded({ extended: false });

// Credentials
var credentials = require('../config/credentials')

//custom modules
var catList = require('../../custom_modules/lists/category-list'),
	dateList = require('../../custom_modules/lists/date-list'),
	disList = require('../../custom_modules/lists/discipline-list');

console.log('stripe key : ' + credentials.stripeKey.serveur)
//STRIPE
var stripe = require('stripe')(credentials.stripeKey.serveur);

//Email config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits);

//Mongoose Models
var Event = require('../models/event');
var Order = require('../models/order');
var User = require('../models/user');

//Date
var dateNow = new Date(Date.now())

/*==========
START APP =>
==========*/

function ensureAuthenticated (req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/user/login');
	}
}

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
				dateDebut : {
					jourDebut : jourDebut[i], //req.body.jourDebut,
					moisDebut : moisDebut[i], //req.body.moisDebut,
					anneeDebut : anneeDebut[i], //req.body.anneeDebut,
					heureDebut : heureDebut[i], //req.body.heureDebut,
					minuteDebut : minuteDebut[i], //req.body.minuteDebut,	
				},		
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
			dateDebut : {
				jourDebut : jourDebut, //req.body.jourDebut,
				moisDebut : moisDebut, //req.body.moisDebut,
				anneeDebut : anneeDebut, //req.body.anneeDebut,
				heureDebut : heureDebut, //req.body.heureDebut,
				minuteDebut : minuteDebut, //req.body.minuteDebut,	
			},		
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
		inscriptionCloture : {
			jourCloture: req.body.jourCloture,
			moisCloture: req.body.moisCloture,
			anneeCloture: req.body.anneeCloture,
			heureCloture: req.body.heureCloture,
			minuteCloture: req.body.minuteCloture,
		},
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

// Trouver un évènement
router.get('/finder', (req, res) => {
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
							    [
							        {
							            tarif: tarif,
							            discipline: discipline ,
							            name: val.eventName,
							            dateDebut: {
							                anneeDebut: val.date.split('/')[2],
							                moisDebut: val.date.split('/')[1],
							                jourDebut: val.date.split('/')[0]
							            },
							            source : "externe"
							        }		
							    ],
					   		 adresse:
						     	{
									ville: val.lieu
						       	},
						    source : "externe"
					   		}					
						allItems.push(item)						
					}
				})
			})	
			return allItems
		})
		.then((json)=>{			
			async.parallel({
			    event: (next) => {
			    	Event.find().exec(next)
			    },
			    participants: (next) => {
			        Order.find().exec(next)
			    }
			}, (err, results) => {
				var eventFromIzir = results.event

				eventFromIzir.forEach((val)=>{
					var eventDate = new Date(val.epreuves[0].dateDebut.anneeDebut, val.epreuves[0].dateDebut.moisDebut - 1 , val.epreuves[0].dateDebut.jourDebut)
					if(eventDate > dateNow) {
						allEvents.push(val)
					}
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
						var eventDate = new Date(val.epreuves[0].dateDebut.anneeDebut, val.epreuves[0].dateDebut.moisDebut - 1 , val.epreuves[0].dateDebut.jourDebut)
						if(eventDate > dateNow) {
							allEvents.push(val)
						}						
					}
				})

				allEvents.sort(function(a, b){
					return new Date(a.epreuves[0].dateDebut.anneeDebut, a.epreuves[0].dateDebut.moisDebut - 1 , a.epreuves[0].dateDebut.jourDebut) - new Date(b.epreuves[0].dateDebut.anneeDebut, b.epreuves[0].dateDebut.moisDebut - 1 , b.epreuves[0].dateDebut.jourDebut)
				})

				data = {
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
});

//Ajouter un évènement GET
router.get('/post-event', ensureAuthenticated, function(req, res){
	var user = req.user
	res.render('partials/event/post-event', { date_list : dateList, category_list : catList, discipline_list : disList });
});

//Ajouter un évènement POST
router.post('/post-event', function(req, res){
	//////EVENT CONSTRUCTOR//////
	var epreuves = epreuveConstructor(req)
	var options = optionConstructor(req)
	var event = eventConstructor(req, epreuves, options)

	var newEvent = new Event(
		event
	)	
	console.log(newEvent)

	//AJOUT DE L'EVENT A LA BDD
	Event.createEvent(newEvent, function(err, user){
		if(err) throw err;
		//REDIRECTION & CONFIRMATION
		req.flash('success_msg', 'Votre évènement est ajouté au calendrier');
		res.redirect('/event/finder')
	});

});

//Modifier un evènement GET
router.get('/edit/:id', ensureAuthenticated, function(req, res){
	Event.findOne({_id: req.params.id}, function (err, event) {
		var event = event
		var adminId = process.env.ADMIN
		var eventUserId = String(event.author)

		if (req.user.id === eventUserId || req.user.id === adminId) { //propriétaire ou ADMIN
			res.render('partials/event/edit-event', {event : event, date_list : dateList, category_list : catList, discipline_list : disList})//si la personne est bien la propriétaire
		} else {
			res.redirect('/event/finder')//sinon res.render('partials/event/finder')
		}
	})
});

//Modifier un evènement POST
router.post('/edit/:id', function(req, res){
	
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
		res.redirect('/user/profil/' + req.user.id +'/');		
	});
});

//détail d'un évènement GET
router.get('/:id', function(req, res){
	async.parallel({
	    event: function(next) {
	    	Event.findById(req.params.id).exec(next)
	    },
	    participants: function(next) {
	        Order.find({event: req.params.id}).populate('user').exec(next)
	    }
	}, function(err, results) {
		var event = results
		res.render('partials/event/event-detail', event);
	});	
})

//inscription à un évènement GET
router.get('/inscription/:id', ensureAuthenticated, function(req, res){
	async.parallel({
	    event: function(next) {
	    	Event.findById(req.params.id).exec(next)
	    },
	    participants: function(next) {
	        Order.find({event: req.params.id}).exec(next)
	    }
	}, function(err, results) {
		var jourNaissance,
			moisNaissance,
			anneeNaissance,
			produisParticipant = results.participants,
			maxParticipant = results.event.epreuves
			allProduits = [],
			uniqueProduit = [];
			

		if(req.user.birthday !== ""){
			try{
				jourNaissance = req.user.birthday.split('/')[0]
				moisNaissance = req.user.birthday.split('/')[1]
				anneeNaissance = req.user.birthday.split('/')[2]	
			} catch(err){
				jourNaissance = ""
				moisNaissance = ""
				anneeNaissance = ""
			}
			
		} else {
			jourNaissance = ""
			moisNaissance = ""
			anneeNaissance = ""
		}

		////Single epreuve init participants
		maxParticipant.forEach((val)=>{
			var epreuve = {
				name : val.name,
				max : val.placesDispo,
				quantity : 0,
				tarif : val.tarif,
				active : true
			}
			uniqueProduit.push(epreuve)
		})		

		//allProduits create
		produisParticipant.forEach((val)=>{
			var details = val.produits
			details.forEach((val)=>{
				if(val.produitsSubTotal > 0){
					allProduits.push(val.produitsRef)
				}
			})
		})

		//uniqueProduit calc
		allProduits.forEach((val)=>{
			var unique = uniqueProduit.find((element)=>{
				if (element.name === val){
					return true
				}
			})
			if(unique !== undefined){
				uniqueProduit.forEach((single)=>{
					if(single.name === val){
						single.quantity = single.quantity+1
					}
				})
			}
		})

		uniqueProduit.forEach((val)=>{
			if(val.quantity >= val.max){
				val.active = false
			}
		})

		var data = {
					results : results,
					jourNaissance : jourNaissance,
					moisNaissance : moisNaissance,
					anneeNaissance : anneeNaissance,
					disponibility : uniqueProduit,
					date_list : dateList,
					category_list : catList,
					discipline_list : disList
				}

		res.render('partials/event/inscription', data);
	});	
});

//inscription à un évènement POST
router.post('/pre-inscription/:id', function(req, res){
	var produits = [],
	ref = req.body.ref,
	tarif = req.body.tarif,
	quantity = req.body.quantity,
	subtotal = req.body.subtotal
	//console.log(ref)

	//ajout des produits dans la commande
	if(subtotal.constructor === Array) {
		for(var i = 0; i < ref.length; i++) {
			//console.log(ref[i])
			var option = {
				produitsRef : ref[i],
				produitsPrix : tarif[i],
				produitsQuantite : quantity[i],
				produitsSubTotal : subtotal[i]
			}
			produits.push(option)
		}
	} else {
		var option = {
			produitsRef : ref,
			produitsPrix : tarif,
			produitsQuantite : quantity,
			produitsSubTotal : subtotal
		}
		produits.push(option)
	}
	//console.log(produits)

	//création de la pré-commande
	var order = new Order ({
	        		user : req.user.id,//user
					event : req.params.id,//event
					eventName : req.body.eventName,
					participant: {
						nom : req.body.surname,
						prenom : req.body.name,
						email : req.body.email,
						sex : req.body.sex,
						dateNaissance: req.body.jourNaissance + '/' + req.body.moisNaissance + '/' + req.body.anneeNaissance,
						team : req.body.team,
						numLicence : req.body.numLicence,
						categorie : req.body.categorie,
						adresse1 : req.body.adresse1,
						adresse2 : req.body.adresse2,
						codePostal : req.body.codePostal,
						city : req.body.city 
					},
					produits : produits,//toute le pack
					orderAmount : req.body.total,
					statut : "pré-inscrit",
					docs : {
						certificat : req.body.certificats,
					},
					updated: new Date()
				});
	//console.log(order)
	
	//enregistrement de la pré-commande
	order.save(function(err, order){
		if(err) throw err;

		//Configuration du mail
		var mailOptions = {
			to: order.participant.email,
			from: 'Nicolas de izir.fr <event@izir.fr>',
			subject: 'Confirmation de pré-inscription N° ' + order.id + 'à ' + order.eventName,
			text: 'Bonjour,\n\n' +
			'vous venez de vous pré-inscrire à l\'épreuve ' + order.eventName +' .\n\n' +
			'Voici les informations sur le participant transmises à l\'organisateur : \n\n' +
			' - Nom : ' + order.participant.nom + '.\n' +
			' - Prénom : ' + order.participant.prenom + '.\n' +
			' - Email : ' + order.participant.email + '.\n\n' +
			' - Date de naissance : ' + order.participant.dateNaissance + '.\n' +
			' - Team : ' + order.participant.team + '.\n' +
			' - Sex : ' + order.participant.sex + '.\n' +
			' - Numéro de Licence : ' + order.participant.numLicence + '.\n' +
			' - Categorie : ' + order.participant.categorie + '.\n' +
			' - Adresse : ' + order.participant.adresse1 + ' ' + order.participant.adresse2 + ' ' + order.participant.codePostal + ' ' + order.participant.city + '.\n\n' +
			'Pour le bien de l\'organisation et afin de garantir votre inscription, n\'oubliez pas d\'effectuer votre règlement en ligne en suivant ce lien http://event.izir.fr/event/checkout/' + order.id + '\n\n' +
			'Bonne course !\n\n' +
			'Nicolas de izir.fr'
			}
		//envoie du mail
		smtpTransport.sendMail(mailOptions);

		req.flash('success_msg', 'Votre pré-inscription à bien été prise en compte');
		res.redirect('/event/checkout/' + order.id)
	});
	
});

//Paiement d'une commande GET
router.get('/checkout/:id', ensureAuthenticated,function(req, res){
	Order.find({_id: req.params.id}).populate('event').exec(function(err, order){
		var order = order
		//console.log(order)
		var data = {
			order: order[0],
			stripe : parseInt(order[0].orderAmount * 100 + 50),
			stripeFrontKey : credentials.stripeKey.front
		}
		//console.log(data)
		res.render('partials/event/checkout', {data : data})
	})
})

//Paiement d'une commande POST
router.post('/checkout/:id', function(req, res){
	var stripeCheckout = {
		amount: req.body.stripe,
		currency: 'eur',
		description: req.body.event,
		source: req.body.stripeToken
	}
	//console.log(stripeCheckout)

	//STIPE
	var charge = stripe.charges.create(
		stripeCheckout,
    function(err, charge) {
    	//console.log(charge)
    	
        if (err) {
        	res.redirect('/user/profil/')
            req.flash('error', 'Une erreure est survenue lors du paiement')
        } else {

        	//UPDATE order.statut : "payé" + paiementCaptured
        	Order.update({_id : req.params.id},
        		{$set : {
        			"statut" : "inscrit",
        			"paiement": { 
        				"amount" : charge.amount,
						"captured": charge.captured,
						"id" : charge.id,
						"object" : charge.object,
						"date" : charge.created
						}
        		}}, function(err, user){
				if(err) {
					res.redirect('/user/profil/')
					req.flash('error', 'Une erreure est survenue lors du paiement')
				} else {
					//console.log(user)
					//EMAIL NOTIFICATION
					smtpTransport
					var mailOptions = {
						to: req.user.email,
						from: 'Event Izir <event@izir.fr>',
						subject: 'Confirmation de paiement et d\'inscription N° ' + req.params.id + ' à l\'épreuve ' + req.body.event,
						text: 	'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte. \n\n' + 
								'Vous venez donc de finaliser votre incription N°' + req.params.id + ' pour l\'épreuve suivante : ' + req.body.event +'.\n\n' + 
								'Vous pouvez à tout moment consulter vos inscriptions en suivant ce lien http://event.izir.fr/user/inscriptions/' + req.user.id + '\n\n' +
								'Bonne course !\n\n' +
								'Nicolas de izir.fr'
					};
					smtpTransport.sendMail(mailOptions);

					//REDIRECTION
			        res.redirect('/user/inscriptions/' + req.user.id + '/')
			        req.flash('success_msg', 'Votre paiement à bien été pris en compte');
				}
			});	
        }	
	})	
})

module.exports = router;