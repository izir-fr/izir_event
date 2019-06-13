var Dossier = require('../../../app/models/chronometrage')
var utf8 = require('../../format/utf8')

var exportModules = {
  registrationFormated: (dbRegistrations, format) => {
    var inscriptions = []

    dbRegistrations.forEach((dbRegistration) => {
      var val = dbRegistration
      var cartBeta = false
      if (val.paiement !== undefined) {
        if (val.paiement.id !== undefined && val.paiement.object !== undefined) {
          cartBeta = true
        }
      }

      if (val.team && val.team.length >= 1) {
        val.team.forEach((member) => {
          var participant = val.participant
          var dossier = new Dossier({
            id: val.id,
            format: format,
            email: member.email,
            contact: '@' + utf8(val.user.name) + '.' + utf8(val.user.surname),
            contactId: val.user._id,
            phone: member.phone,
            sex: member.sex,
            licence: member.numLicence,
            dateNaissance: member.dateNaissance,
            produits: val.produits,
            team: participant.team,
            date: val.created_at,
            organisateur_validation: val.organisateur_validation.all,
            cart_beta: cartBeta,
            cart: val.cart,
            orderAmount: val.orderAmount,
            event: val.event
          })

          var formatedDossier = dossier.formatedDossied({
            nom: member.nom,
            prenom: member.prenom,
            adresse1: participant.adresse1,
            adresse2: participant.adresse2,
            codePostal: participant.codePostal,
            city: participant.city,
            categorie: participant.categorie,
            teamConfig: true,
            participantTeam: participant.team,
            paiement: val.paiement,
            certificat: member.docs.certificat
          })
          inscriptions.push(formatedDossier)
        })
      } else {
        var participant = val.participant
        if (participant.nom === '' || participant.nom === null || participant.nom === undefined) {
          participant.nom = val.user.surname
        }
        if (participant.prenom === '' || participant.prenom === null || participant.prenom === undefined) {
          participant.prenom = val.user.name
        }
        if (participant.email === '' || participant.email === null || participant.email === undefined) {
          participant.email = val.user.email
        }
        var dossier = new Dossier({
          id: val.id,
          format: format,
          email: participant.email,
          contact: '@' + utf8(val.user.name) + '.' + utf8(val.user.surname),
          contactId: val.user._id,
          phone: participant.phone,
          sex: participant.sex,
          licence: participant.numLicence,
          dateNaissance: participant.dateNaissance,
          produits: val.produits,
          team: participant.team,
          date: val.created_at,
          organisateur_validation: val.organisateur_validation.all,
          cart_beta: cartBeta,
          cart: val.cart,
          orderAmount: val.orderAmount,
          event: val.event
        })

        var formatedDossier = dossier.formatedDossied({
          nom: participant.nom,
          prenom: participant.prenom,
          adresse1: participant.adresse1,
          adresse2: participant.adresse2,
          codePostal: participant.codePostal,
          city: participant.city,
          categorie: participant.categorie,
          teamConfig: false,
          participantTeam: participant.team,
          paiement: val.paiement,
          certificat: val.docs.certificat
        })
        inscriptions.push(formatedDossier)
      }
    })
    return inscriptions
  }
}

module.exports = exportModules
