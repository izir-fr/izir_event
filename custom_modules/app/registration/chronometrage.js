var Dossier = require('./chronometrageModel')

var exportModules = {
  registrationFormated: (dbRegistrations, format) => {
    var inscriptions = []

    dbRegistrations.forEach((val) => {
      if (val.team && val.team.length >= 1) {
        val.team.forEach((member) => {
          var participant = val.participant
          var dossier = new Dossier({
            id: val.id,
            email: member.email,
            phone: member.phone,
            sex: member.sex,
            licence: member.numLicence,
            dateNaissance: member.dateNaissance,
            team: participant.team
          })

          var formatedDossier = dossier.formatedDossied({
            nom: member.nom,
            prenom: member.prenom,
            adresse1: participant.adresse1,
            adresse2: participant.adresse2,
            codePostal: participant.codePostal,
            city: participant.city,
            categorie: participant.categorie,
            format: format,
            teamConfig: true,
            participantTeam: participant.team,
            produits: val.produits,
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
          email: participant.email,
          phone: participant.phone,
          sex: participant.sex,
          licence: participant.numLicence,
          dateNaissance: participant.dateNaissance,
          team: participant.team
        })

        var formatedDossier = dossier.formatedDossied({
          nom: participant.nom,
          prenom: participant.prenom,
          adresse1: participant.adresse1,
          adresse2: participant.adresse2,
          codePostal: participant.codePostal,
          city: participant.city,
          categorie: participant.categorie,
          format: format,
          teamConfig: false,
          participantTeam: participant.team,
          produits: val.produits,
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
