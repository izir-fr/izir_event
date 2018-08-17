var formParticipantData = require('./formParticipantData')()

// User definition
var user = {
  nom: formParticipantData.nom.val(),
  prenom: formParticipantData.prenom.val(),
  email: formParticipantData.email.val(),
  jourNaissance: formParticipantData.jourNaissance.val(),
  moisNaissance: formParticipantData.moisNaissance.val(),
  anneeNaissance: formParticipantData.anneeNaissance.val(),
  team: formParticipantData.team.val(),
  sex: formParticipantData.sex.val(),
  numLicence: formParticipantData.numLicence.val(),
  categorie: formParticipantData.categorie.val(),
  event: formParticipantData.event.val(),
  adresse1: formParticipantData.adresse1.val(),
  adresse2: formParticipantData.adresse2.val(),
  codePostal: formParticipantData.codePostal.val(),
  city: formParticipantData.city.val(),
  certificat: formParticipantData.certificat.val()
}

module.exports = user
