var checkout = () => {
  var helper = $('#helper')
  $('#checkout-validation-warning').append(helper)

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
  $('.paiement_option').on('click', (e) => {
    // init paiement
    $('.paiement_option_sub').addClass('hidde')
    $('.paiement_option_checkbox').removeClass('fa-check-square')
    $('.paiement_option_checkbox').addClass('fa-square-o')
    // action on selected paiement option
    $(e.currentTarget).find('.paiement_option_sub').removeClass('hidde')
    $(e.currentTarget).find('.paiement_option_checkbox').removeClass('fa-square-o')
    $(e.currentTarget).find('.paiement_option_checkbox').addClass('fa-check-square')
  })
}

export default checkout()
