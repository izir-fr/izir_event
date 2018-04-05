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

//Email nodemailer config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits);

//Sendinblue
var defaultClient = SibApiV3Sdk.ApiClient.instance,
	apiKey = defaultClient.authentications['api-key'];
	apiKey.apiKey = credentials.sendinblueCredits

/*==========
START APP =>
==========*/

// Register
router.get('/register', function(req, res){
	res.render('partials/user/register');
});

// Login
router.get('/login', function(req, res){
	if(req.user){
		res.redirect('profil/' + req.user.id +'/');
	} else {
		res.render('partials/user/login');
	}
	
});

// Profil
router.get('/profil', ensureAuthenticated, urlencodedParser, function(req, res){
	var user = req.user
	res.redirect('/user/profil/' + user.id +'/');
});
router.get('/profil/:id', ensureAuthenticated, urlencodedParser, function(req, res){
		res.render('partials/user/profil');
});

//Lost Password GET
router.get('/password-forgot', function(req, res){
	res.render('partials/user/password-forgot');
});

// Register User
router.post('/register', function(req, res){
	var errors

	try {
		var name = req.body.name.toLowerCase();
		var surname = req.body.surname.toLowerCase();
		var username = req.body.username.toLowerCase();
		var email = req.body.email.toLowerCase();
		var password = req.body.password;
		var password2 = req.body.password2;
	} catch (err) {
		res.render('partials/user/register', {error : err});
	}

	var tests = [
		{
			search : {username : username},
			msg : 'Ce non d\'utilisateur est déjà utilisé. Si vous avez oublié votre mot de passe, merci de cliquez sur mot de passe oublié.'
		},
		{
			search : {email : email},
			msg : 'C\'est email est déjà utilisé. Si vous avez oublié votre mot de passe, merci de cliquez sur mot de passe oublié.'
		}
	]

	var validationUser = (search, message, success)=>{
		User.findOne(search, (err, res) => {
			if (err) {
				throw err
			} else {
				if(res !== null){
					//console.log(res)
					errors = message
				}
				success(errors)
			}
		})
	}

	var createAction = (errors)=>{
		if(errors){
			//console.log(errors)
			res.render('partials/user/register', {error : errors});
		} else {
			var newUser = new User({
				name: name,
				surname : surname,
				email: email,
				username: username,
				password: password
			});

			//console.log(newUser)
			User.createUser(newUser, function(err, user){
				if(err) throw err;
				//Create sendinblue contact
				var apiInstance = new SibApiV3Sdk.ContactsApi();
				var createContact = new SibApiV3Sdk.CreateContact(); // CreateContact | Values to create a contact

				createContact = {
					email : newUser.email,
					attributes : {
						'PRENOM' : newUser.name,
						'NOM' : newUser.surname
					},
					listIds : [21, 18],
					updateEnabled : true
				}

				apiInstance.createContact(createContact).then((data)=> {
				  console.log('API called successfully. Returned data: ' + data);
				}, function(error) {
				  console.error(error);
				});
				
			});

			req.flash('success_msg', 'Vous êtes enregistré et pouvez vous connecter');
			res.redirect('/user/login');
		}
	}

	// Validation
	req.checkBody('name', 'Prénom requis').notEmpty();
	req.checkBody('surname', 'Nom requis').notEmpty();
	req.checkBody('email', 'Email requis').notEmpty();
	req.checkBody('email', 'Email invalid').isEmail();
	req.checkBody('username', 'Nom d\'utilisateur requis').notEmpty();
	req.checkBody('password', 'Mot de passe requis').notEmpty();
	req.checkBody('password2', 'Les mots de passe ne sont pas identiques').equals(req.body.password);

	errors = req.validationErrors();

	//console.log(test)
	validationUser(tests[0].search, tests[0].msg,(res)=>{
		validationUser(tests[1].search, tests[1].msg,(res)=>{
			createAction(res)
		})
	})

});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username.toLowerCase(), function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Utilisateur inconnu'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Mot de passe incorrect'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//Login POST
router.post('/login',
  passport.authenticate('local', {successRedirect: '/event/finder', failureRedirect:'/user/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});

//Lost password POST
router.post('/password-forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'Aucun compte n\'existe avec cette adresse e-mail');
          return res.redirect('/user/password-forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: 'Event Izir <event@izir.fr>',
        subject: 'Réinitialisation du mot de passe',
        text: 'Vous recevez cet email car vous (ou quelqu\'un d\'autre) à demander de réinitialiser le mode de passe de votre compte.\n\n' +
          'Merci de cliquer sur le lien suivant ou de le copier-coller dans votre navigateure pour continuer le processus:\n\n' +
          'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
          'Si vous n\'êtes pas à l\'origine de cette demande merci d\'ignorer cet email, ainsi votre mot de passe restera inchangé.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'Un email a été envoyé à ' + user.email + ' avec toutes les instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/reset/:token', function(req, res){
	var user = User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	    if (!user) {
	      req.flash('error', 'Votre demande changement de mot de passe n\'est pas valide ou à expiré.');
	      return res.redirect('/user/password-forgot');
	    } else {
	    	var data = {user: user, resetPasswordToken: user.resetPasswordToken};
	    	console.log(data)
			res.render('partials/user/reset', data);
		} 
  	});
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Votre demande changement de mot de passe n\'est pas valide ou à expiré.');
          return res.redirect('back');
        }

        // Validation
        var password = req.body.password;
		var password2 = req.body.password2;
		req.checkBody('password', 'Mot de passe requis').notEmpty();
		req.checkBody('password2', 'Les mots de passe ne sont pas identiques').equals(req.body.password);

		// Generate a salt
		var salt = bcrypt.genSaltSync(10);
		// Hash the password with the salt
		var hash = bcrypt.hashSync(password, salt);

		var errors = req.validationErrors();

		if(errors){
			res.render('partials/reset',{
				error : errors
		})} else {
	        user.password = hash
	        user.resetPasswordToken = undefined;
	        user.resetPasswordExpires = undefined;

	        user.save(function(err) {
				req.logIn(user, function(err) {
					done(err, user);
				});
	        });
		}
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'Event Izir <event@izir.fr>',
        subject: 'Votre mot de passe a été changé',
        text: 'Bonjour,\n\n' +
          'Ceci est une confirmation que le mot de passe pour le compte ' + user.email + ' a bien été changé.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Bravo! Votre mot de passe a été changé.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

// Update Profil
router.get('/edit-profil/:id',ensureAuthenticated, function(req, res){
	var jourNaissance,
		moisNaissance,
		anneeNaissance,
		data;

	if(req.user.id === req.params.id) {
		User.findById(req.user.id, function(err, user){
			if (err) throw err

			if(user.birthday){
				jourNaissance = user.birthday.split('/')[0]
				moisNaissance = user.birthday.split('/')[1]
				anneeNaissance = user.birthday.split('/')[2]
			} else {
				jourNaissance = ""
				moisNaissance = ""
				anneeNaissance = ""
			}

			data = {
				jourNaissance : jourNaissance,
				moisNaissance : moisNaissance,
				anneeNaissance : anneeNaissance
			};	
			//console.log(user)

			//console.log(data)
			res.render('partials/user/edit-profil', { data : data,  date_list : dateList, category_list : catList })
		})
	} else {
		res.redirect('/user/profil/' + req.user.id +'/')
	}
});

// Update Profil POST
router.post('/edit-profil/:id', function(req, res){

	try {
		var updateUser = {
			name : req.body.name.toLowerCase(),//prénom
			surname  : req.body.surname.toLowerCase(),//Nom
			username  : req.body.username.toLowerCase(),//Pseudo
			birthday : req.body.jourNaissance + '/' + req.body.moisNaissance + '/' + req.body.anneeNaissance,//Date de naissance
			sex : req.body.sex,//Je suis
			numLicence : req.body.numLicence,
			categorie : req.body.categorie,
			team : req.body.team,	
			adresse1 : req.body.adresse1.toLowerCase(),//Adresse 1
			adresse2 : req.body.adresse2.toLowerCase(),//Adresse 2
			codePostal : req.body.codePostal,//Code Postal
			city : req.body.city.toLowerCase(),//Ville
			email : req.body.email.toLowerCase(),//Email
			foneFix : req.body.foneFix,//Téléphone Fix
			fonePort : req.body.fonePort,//Téléphone port
			updated: new Date()
		};
	} catch(err) {
		req.flash('error', err);
		res.redirect('/user/edit-profil/' + req.user.id);
	}

	User.findByIdAndUpdate(req.user.id, updateUser, function(err, user){
		if(err) {
			req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre profil');
			res.redirect('/user/edit-profil/' + req.user.id);
		} else {
			req.flash('success_msg', 'Votre profil a été mis à jour');
			res.redirect('/user/profil/' + req.user.id +'/');			
		}
	});
});

//Vue des inscriptions
router.get('/inscriptions/:id',ensureAuthenticated, function(req, res){
	Registration.find({user: req.user.id}).populate('event').exec(function(err, registrations){
		var registrations = registrations
		res.render('partials/user/recap-inscriptions', {registrations : registrations})
	})
});

//Vue Organisateur des épreuves
router.get('/epreuves/:id',ensureAuthenticated, function(req, res){
	Event.find({author: req.user.id}, function (err, event) {
		var event = event
		res.render('partials/organisateurs/event-list', {event : event})
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

//Inviter des amis
router.get('/certificat/:id', ensureAuthenticated, function(req, res){
	res.render('partials/user/certificat');
})

router.post('/certificat/:id', function(req, res){
	var certificat = req.body.certificats

	if(certificat === '' || certificat === undefined){
		req.flash('error', 'Aucun certificat n\'a été joint');
		res.redirect('/user/certificat/' + req.user.id);
	} else {
		try {
			var updateUser = {
				certificat: {
					expiration_month : req.body.month,
					expiration_year : req.body.year,
					file : certificat,
					updated: new Date()
				},
				updated: new Date()
			};
		} catch(err) {
			req.flash('error', err);
			res.redirect('/user/certificat/' + req.user.id);
		}

		User.findByIdAndUpdate(req.user.id, updateUser, function(err, user){
			if(err) {
				req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre certificat');
				res.redirect('/user/certificat/' + req.user.id);
			} else {
				req.flash('success_msg', 'Votre certificat a été mis à jour');
				res.redirect('/user/profil/' + req.user.id +'/');			
			}
		});		
	}
})


//Inviter des amis
router.get('/amis', ensureAuthenticated, function(req, res){
	res.render('partials/user/amis');
})

//Inviter des amis
router.post('/amis/:id', function(req, res){
	var invitations = [],
		invitation,
		emails = req.body.email;

	if(emails.constructor === Array) {	
		emails.forEach((val)=>{
			if(val !== ""){
				invitations.push(val)				
			}
		})
	} else {
		invitations.push(emails)
	}

	invitations.forEach((val)=>{
		var mailOptions = {
			to: val,
			from: req.user.name + ' ' + req.user.surname + ' <' + req.user.email + '>',
			subject: 'Connais-tu Event Izir',
			text: req.body.description + '\n\n'
		};
		smtpTransport.sendMail(mailOptions, function(err) {
		done(err, 'done');
		});	
	
	})
	
	req.flash('success_msg', 'Vos amis ont été invités');
	res.redirect('/user/profil/' + req.user.id +'/');	
})

//Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'Vous êtes déconnecté');
	res.redirect('/');
});

//Contacter par email un participant
router.get('/contacter/:id', ensureAuthenticated, function(req, res){
	Registration.findById(req.params.id).populate('event').exec((err, data)=>{
		if(err) {
			res.render('partials/user/profil/' + req.user.id, {error : errors});
		} else {
			var data = {data}
			res.render('partials/organisateurs/contacter', data);			
		}
	})
})

//Contacter par email un participant
router.post('/contacter/:id', function(req, res){
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
})

router.get('/comptabilite/:id', ensureAuthenticated, function(req, res){
	res.render('partials/user/comptabilite');
})

router.post('/comptabilite/:id', function(req, res){

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
		res.redirect('/user/comptabilite/' + req.user.id);
	}

	console.log(updateUser)

	User.findByIdAndUpdate(req.user.id, updateUser, function(err, user){
		if(err) {
			req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre RIB');
			res.redirect('/user/comptabilite/' + req.user.id);
		} else {
			req.flash('success_msg', 'Votre RIB a été mis à jour');
			res.redirect('/user/profil/' + req.user.id +'/');			
		}
	});	

})

module.exports = router;