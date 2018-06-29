var checkout = () => {
  if ($('.stripe-button-el').length === 1) {
    $('.stripe-button-el').addClass('btn btn-danger d-block w-100').removeClass('stripe-button-el')
    $('button > span').addClass('spacer-xs-top')
    $('#other-checkout').on('click', (e) => {
      var otherCheckout = window.confirm('Souhaitez-vous valider un paiement par chèque / espèce ?')
      if (!otherCheckout) {
        e.preventDefault()
      }
    })
  }
  $('#paiement_CB').on('click', () => {
    $('#paiement_CB_checkbox > i').toggleClass('fa-square-o')
    $('#paiement_CB_checkbox > i').toggleClass('fa-check-square')
    $('#paiement_CB_sub').toggleClass('hidde')
  })
  $('#paiement_other').on('click', () => {
    $('#paiement_other_checkbox > i').toggleClass('fa-square-o')
    $('#paiement_other_checkbox > i').toggleClass('fa-check-square')
    $('#paiement_other_sub').toggleClass('hidde')
  })
}

export default checkout()
