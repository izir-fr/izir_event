var async = require('async'),
  bodyParser = require('body-parser'),
  Promise = require('bluebird'),
  bcrypt = require('bcryptjs'),
  crypto = require('crypto'),
  express = require('express'),
  fs = require('fs'),
  LocalStrategy = require('passport-local').Strategy,
  router = express.Router(),
  SibApiV3Sdk = require('sib-api-v3-sdk'),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  path = require('path'),
  passport = require('passport'),
  request = require("request"),
  json2csv = require('json2csv'),
  urlencodedParser = bodyParser.urlencoded({ extended: false });

// Credentials
var credentials = require('../config/credentials');

//custom modules
var catList = require('../../custom_modules/lists/category-list'),
  dateList = require('../../custom_modules/lists/date-list'),
  disList = require('../../custom_modules/lists/discipline-list');

//STRIPE
var stripe = require('stripe')(credentials.stripeKey.serveur);
//Email config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits);

// Models
var Event = require('../models/event'),
  Registration = require('../models/registration'),
  User = require('../models/user');

var registrationCtrl = {
  // Get a pre-inscription form
  getPreinscription : function(req, res){
    async.parallel({
        event: function(next) {
          Event.findById(req.params.id).exec(next)
        },
        participants: function(next) {
            Registration.find({event: req.params.id}).exec(next)
        }
    }, function(err, results) {
      var jourNaissance,
        moisNaissance,
        anneeNaissance,
        produisParticipant = results.participants,
        maxParticipant = results.event.epreuves,
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

      res.render('partials/registration/pre-inscription', data);
    }); 
  },
  // Post a pre-inscription
  postPreinscription : function(req, res){
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
    var registration = new Registration ({
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
    //console.log(registration)
    
    //enregistrement de la pré-commande
    registration.save(function(err, registration){
      if(err) throw err;

      //Configuration du mail
      var mailOptions = {
        to: registration.participant.email,
        from: 'Nicolas de izir.fr <event@izir.fr>',
        subject: 'Confirmation de pré-inscription N° ' + registration.id + 'à ' + registration.eventName,
        text: 'Bonjour,\n\n' +
        'vous venez de vous pré-inscrire à l\'épreuve ' + registration.eventName +' .\n\n' +
        'Voici les informations sur le participant transmises à l\'organisateur : \n\n' +
        ' - Nom : ' + registration.participant.nom + '.\n' +
        ' - Prénom : ' + registration.participant.prenom + '.\n' +
        ' - Email : ' + registration.participant.email + '.\n\n' +
        ' - Date de naissance : ' + registration.participant.dateNaissance + '.\n' +
        ' - Team : ' + registration.participant.team + '.\n' +
        ' - Sex : ' + registration.participant.sex + '.\n' +
        ' - Numéro de Licence : ' + registration.participant.numLicence + '.\n' +
        ' - Categorie : ' + registration.participant.categorie + '.\n' +
        ' - Adresse : ' + registration.participant.adresse1 + ' ' + registration.participant.adresse2 + ' ' + registration.participant.codePostal + ' ' + registration.participant.city + '.\n\n' +
        'Pour le bien de l\'organisation et afin de garantir votre inscription, n\'oubliez pas d\'effectuer votre règlement en ligne en suivant ce lien http://event.izir.fr/inscription/checkout/' + registration.id + '\n\n' +
        'Bonne course !\n\n' +
        'Nicolas de izir.fr'
        }
      //envoie du mail
      smtpTransport.sendMail(mailOptions);

      req.flash('success_msg', 'Votre pré-inscription à bien été prise en compte');
      res.redirect('/inscription/checkout/' + registration.id)
    });
    
  },
  // Get checkout form
  getCheckout : function(req, res){
    Registration.find({_id: req.params.id}).populate('event').exec(function(err, registration){
      var registration = registration
      //console.log(registration )
      var data = {
        registration: registration[0],
        stripe : parseInt(registration[0].orderAmount * 100 + 50),
        stripeFrontKey : credentials.stripeKey.front
      }
      //console.log(data)
      res.render('partials/registration/checkout', {data : data})
    })
  },
  getOtherPaiement : function(req, res){
    var id = req.params.id
    // do somthings
    Registration.update(
      {_id : id},
      {$set : { 'paiement': {'other': true }, 'updated': new Date(Date.now()) } },
      function(err, user) {
        if(err) {
          res.redirect('/user/profil/')
          req.flash('error', 'Une erreure est survenue lors du paiement')
        } else {
          //REDIRECTION
          res.redirect('/inscription/checkout/' + id )
          req.flash('success_msg', 'Votre paiement à bien été pris en compte');
        }
      }
    );   
  },
  getOtherCaptured : function(req, res){
    var id = req.params.id
    // do somthings
    Registration.update(
      {_id : id},
      {$set : { 'paiement': {'other_captured': true }, 'updated': new Date(Date.now()), 'statut': 'inscrit' } },
      function(err, val) {

        Registration.findById(id, (err, val)=>{
          if (err) {
            res.redirect('/inscription/recap/organisateur/' + val.event)
            req.flash('error', 'Une erreur est survenue lors de la validation du paiement')
          } else {
            //EMAIL NOTIFICATION
            smtpTransport
            var mailOptions = {
              to: val.participant.email,
              from: 'Event Izir <event@izir.fr>',
              subject: 'Confirmation de paiement et d\'inscription N° ' + id + ' à l\'épreuve ' + val.eventName,
              text:   'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte. \n\n' + 
                  'Vous venez donc de finaliser votre incription N°' + id + ' pour l\'épreuve suivante : ' + val.eventName +'.\n\n' + 
                  'Vous pouvez à tout moment consulter vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + val.user + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
            };
            smtpTransport.sendMail(mailOptions);
            //REDIRECTION
            res.redirect('/inscription/recap/organisateur/' + val.event )
            req.flash('success_msg', 'L\'inscription N°' + id + ' est mis à jour avec un paiement guichet (chèque / espèces)');
          }
        })
      }
    );   
  },
  // Post a checkout
  postCheckout : function(req, res){
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
              req.flash('error', 'Une erreur est survenue lors du paiement')
          } else {

            //UPDATE registration.statut : "payé" + paiementCaptured
            Registration.update({_id : req.params.id}, {$set : 
              {
                "statut" : "inscrit",
                "paiement": { 
                  "amount" : charge.amount,
                  "captured": charge.captured,
                  "id" : charge.id,
                  "object" : charge.object,
                  "date" : charge.created
                }
              }
            }, function(err, user){
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
              text:   'Nous avons le plaisir de vous confirmer que votre paiement a bien été pris en compte. \n\n' + 
                  'Vous venez donc de finaliser votre incription N°' + req.params.id + ' pour l\'épreuve suivante : ' + req.body.event +'.\n\n' + 
                  'Vous pouvez à tout moment consulter vos inscriptions en suivant ce lien http://event.izir.fr/inscription/recap/user/' + req.user.id + '\n\n' +
                  'Bonne course !\n\n' +
                  'Nicolas de izir.fr'
            };
            smtpTransport.sendMail(mailOptions);

            //REDIRECTION
                res.redirect('/inscription/recap/user/' + req.user.id + '/')
                req.flash('success_msg', 'Votre paiement à bien été pris en compte');
          }
        }); 
          } 
    })  
  },
  // Get user all inscription recap
  getRecapUser : function(req, res){
    Registration.find({user: req.user.id}).populate('event').exec(function(err, registrations){
      var registrations = registrations
      res.render('partials/registration/recap-user', {registrations : registrations})
    })
  },
  // Get organisateur a recap
  getRecapOrganisateur : function(req, res){
    async.parallel({
        event: function(next) {
          Event.findById(req.params.id).exec(next)
        },
        participants: function(next) {
            Registration.find({event: req.params.id}).populate('user').exec(next)
        }
    }, function(err, results) {
      var event = results
      res.render('partials/registration/recap-organisateur', event);
    }); 
  },
  // Get a file excell
  getFileExcell : function(req, res){
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
          res.redirect('/inscription/recap/organisateur/' + req.user.id );
      }
    }); 
  },
  // Get a file GmCAP
  getFileGmcap : function(req, res){
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
        var csv = json2csv({ data: inscriptions, fields: fields, unwindPath: ['COURSE'], del : '  ', quotes : ''});
        fs.writeFile(req.params.id + '.txt', csv, 'ascii', (err) => {
          if (err) throw err;
          res.download('./' + req.params.id + '.txt');
        });     
      } catch (err) {
        req.flash('error', 'Une erreur est survenue, si elle se reproduit merci de contacter le service client.');
          res.redirect('/inscription/recap/organisateur/' + req.user.id );
      }
    }); 
  }
}

module.exports = registrationCtrl;