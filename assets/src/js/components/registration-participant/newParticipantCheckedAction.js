var user = require('./user')

var newParticipantCheckedAction = () => {
  var formParticipantData = require('./formParticipantData')()

  if ($($('input[name=newParticipant]')[0]).is(':checked')) {
    $(formParticipantData.nom[0]).val('')
    $(formParticipantData.prenom[0]).val('')
    $(formParticipantData.email[0]).val('')
    $(formParticipantData.jourNaissance[0]).val('')
    $(formParticipantData.moisNaissance[0]).val('')
    $(formParticipantData.anneeNaissance[0]).val('')
    $(formParticipantData.team[0]).val('')
    $(formParticipantData.sex[0]).val('')
    $(formParticipantData.numLicence[0]).val('')
    $(formParticipantData.categorie[0]).val('')
    $(formParticipantData.event[0]).val('')
    $(formParticipantData.adresse1[0]).val('')
    $(formParticipantData.adresse2[0]).val('')
    $(formParticipantData.codePostal[0]).val('')
    $(formParticipantData.city[0]).val('')

    // certificat
    $('#user_certificat').addClass('hidde')
    $('#other_participant_certificat').removeClass('hidde')
    formParticipantData.certificat.val('')
  } else {
    formParticipantData.nom.val(user.nom)
    formParticipantData.prenom.val(user.prenom)
    formParticipantData.email.val(user.email)
    formParticipantData.jourNaissance.val(user.jourNaissance)
    formParticipantData.moisNaissance.val(user.moisNaissance)
    formParticipantData.anneeNaissance.val(user.anneeNaissance)
    formParticipantData.team.val(user.team)
    formParticipantData.sex.val(user.sex)
    formParticipantData.categorie.val(user.categorie)
    formParticipantData.adresse1.val(user.adresse1)
    formParticipantData.adresse2.val(user.adresse2)
    formParticipantData.codePostal.val(user.codePostal)
    formParticipantData.city.val(user.city)
    formParticipantData.certificat.val(user.certificat)
    // certificat
    $('#user_certificat').removeClass('hidde')
    $('#other_participant_certificat').addClass('hidde')
  }
}

module.exports = newParticipantCheckedAction
