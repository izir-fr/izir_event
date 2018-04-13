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
}

export default checkout()
