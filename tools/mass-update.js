//DB UPDATE
//Mongoose Models
var Event = require('../models/event');
var Order = require('../models/order');
var User = require('../models/user');

var query = { user : process.env.ADMIN }//solo admin for test

module.exports = Order.find( query ,(err,res)=>{
  res.forEach((res)=>{
    Order.update({_id : res.id},
            {$set : {
              "participant": {
                "nom": res.participant.nom,
                "prenom": res.participant.prenom,
                "email": res.participant.email,
                "sex": res.participant.sex,
                "dateNaissance": res.participant.dateNaissance,
                "team": res.participant.team,
                "numLicence": res.participant.numLicence,
                "categorie": res.participant.categorie,
                "adresse1" : res.participant.adresse.adresse1 ,
                "adresse2" : res.participant.adresse.adresse2 ,
                "codePostal" : res.participant.adresse.codePostal ,
                "city" :  res.participant.adresse.city,
                "adresse" : {
                  "adresse1" : res.participant.adresse.adresse1 ,
                  "adresse2" : res.participant.adresse.adresse2 ,
                  "codePostal" : res.participant.adresse.codePostal ,
                  "city" :  res.participant.adresse.city,
                } 
              }
            }},(err,res)=>{
              console.log(res)
            })
    //console.log(res.participant)
  })
})