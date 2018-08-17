var teamCertificatValidation = (form) => {
  var certificatError = 0

  // certificat validation init
  form.option.certificatValidation = false

  // all certificats added
  form.data.team.membres.forEach((val) => {
    if (val.certificat === null || val.certificat === '') {
      certificatError += 1
    }
  })

  // all certificats checkbox checked
  $('input[name=certificatCondition_member]').each((key, val) => {
    if (val.checked === false) {
      certificatError += 1
    }
  })

  if ($('input[name=certificat_required]').val() === 'false') {
    form.option.certificatValidation = true
  } else if (certificatError < 1) {
    form.option.certificatValidation = true
  } else {
    form.option.certificatValidation = false
  }

  return form
}

module.exports = teamCertificatValidation
