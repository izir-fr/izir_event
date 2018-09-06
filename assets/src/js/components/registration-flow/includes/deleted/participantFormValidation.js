var formToComplete = require('./formToComplete')

var participantFormValidation = (form) => {
  form.data.participant = {
    nom: null,
    prenom: null,
    email: null,
    jourNaissance: null,
    moisNaissance: null,
    anneeNaissance: null,
    team: null,
    sex: null,
    numLicence: null,
    categorie: null,
    event: null,
    adresse1: null,
    adresse2: null,
    codePostal: null,
    city: null,
    certificat: null
  }

  var formParticipantData = require('./formParticipantData')()

  // UX borders init
  $('input').removeClass('border border-danger')
  $($('#confirmation-epreuve').children()).remove()

  // form validation init
  form.option.formValidation = false

  // FORM VALIDATION
  if (formParticipantData.nom.val() === '') {
    formToComplete(formParticipantData.nom)
  } else if (formParticipantData.prenom.val() === '') {
    formToComplete(formParticipantData.prenom)
  } else if (formParticipantData.email.val() === '' || formParticipantData.email.val() === null || form.option.emailRegex.test(formParticipantData.email.val()) === false) {
    formToComplete(formParticipantData.email)
  } else if (formParticipantData.sex.val() === null || formParticipantData.sex.val() === '') {
    formToComplete(formParticipantData.sex)
  } else if (formParticipantData.jourNaissance.val() === null || formParticipantData.jourNaissance.val() === '') {
    formToComplete(formParticipantData.jourNaissance)
  } else if (formParticipantData.moisNaissance.val() === null || formParticipantData.moisNaissance.val() === '') {
    formToComplete(formParticipantData.moisNaissance)
  } else if (formParticipantData.anneeNaissance.val() === '' || Number(formParticipantData.anneeNaissance.val()) < 1900) {
    formToComplete(formParticipantData.anneeNaissance)
  } else if (formParticipantData.categorie.val() === null || formParticipantData.categorie.val() === '') {
    formToComplete(formParticipantData.categorie)
  } else if (formParticipantData.adresse1.val() === '') {
    formToComplete(formParticipantData.adresse1)
  } else if (formParticipantData.codePostal.val() === '') {
    formToComplete(formParticipantData.codePostal)
  } else if (formParticipantData.city.val() === '') {
    formToComplete(formParticipantData.city)
  } else {
    form.option.formValidation = true
    form.data.participant.nom = formParticipantData.nom.val()
    form.data.participant.prenom = formParticipantData.prenom.val()
    form.data.participant.email = formParticipantData.email.val()
    form.data.participant.jourNaissance = formParticipantData.jourNaissance.val()
    form.data.participant.moisNaissance = formParticipantData.moisNaissance.val()
    form.data.participant.anneeNaissance = formParticipantData.anneeNaissance.val()
    form.data.participant.team = formParticipantData.team.val()
    form.data.participant.sex = formParticipantData.sex.val()
    form.data.participant.numLicence = formParticipantData.numLicence.val()
    form.data.participant.categorie = formParticipantData.categorie.val()
    form.data.participant.event = formParticipantData.event.val()
    form.data.participant.adresse1 = formParticipantData.adresse1.val()
    form.data.participant.adresse2 = formParticipantData.adresse2.val()
    form.data.participant.codePostal = formParticipantData.codePostal.val()
    form.data.participant.city = formParticipantData.city.val()
    form.data.participant.certificat = formParticipantData.certificat.val()
  }

  return form
}

module.exports = participantFormValidation
