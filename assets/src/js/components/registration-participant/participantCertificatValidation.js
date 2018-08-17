var participantCertificatValidation = (form) => {
  form.data.participant.certificat = null
  var certificat = require('./formParticipantData')().certificat

  // certificat validation init
  form.option.certificatValidation = false

  // CERTIFICAT VALIDATION
  if ($('input[name=certificat_required]').val() === 'false') {
    form.option.certificatValidation = true
  } else if (certificat.val() === null || certificat.val() === '') {
    form.option.certificatValidation = false
  } else if ($('input[name=certificatCondition]').is(':checked') === false) {
    form.option.certificatValidation = false
  } else {
    form.option.certificatValidation = $('input[name=certificatCondition]').is(':checked')
  }

  if (form.option.certificatValidation === true) {
    form.data.participant.certificat = certificat.val()
  }

  return form
}

module.exports = participantCertificatValidation
