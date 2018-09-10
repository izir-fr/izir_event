var teamFormDone = (form) => {
  if (form.option.epreuve_format.team) {
    $('#team-form-submit').addClass('disabled')
    $('#team-validation-warning').removeClass('hidde')
    if (form.option.certificatValidation === true && form.option.formValidation === true) {
      $('#team-form-submit').removeClass('disabled')
      $('#team-validation-warning').addClass('hidde')
    }
  }
}

module.exports = teamFormDone
