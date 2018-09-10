var dateNow = new Date(Date.now())

var step = [
  $('#cart-form'),
  $('#participant-form'),
  $('#team-form'),
  $('#checkout-form'),
  $('#certificat-form')
]

var checkDate = () => {
  var dateLimite = new Date($('input[name=dateLimite]').val())

  if (dateNow > dateLimite) {
    step.forEach((val) => {
      $(val.children()).each((key, val) => {
        $(val).remove()
      })
      val.append('<div class="col-sm-11 mx-auto mt-2"><p class="alert alert-danger">La date limite d\'inscription à cette épreuve est dépassée.</p></div>')
    })
  }
}

export default checkDate()
