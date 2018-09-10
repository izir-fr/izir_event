var participantFormDone = (form) => {
  if (form.option.epreuve_format.individuel) {
    $('#participant-form-submit').addClass('disabled')
    $('#participant-validation-warning').removeClass('hidde')
    if (form.option.certificatValidation === true && form.option.formValidation === true) {
      $('#participant-form-submit').removeClass('disabled')
      $('#participant-validation-warning').addClass('hidde')
    }
  }
}

module.exports = participantFormDone
