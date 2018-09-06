// form defaults options definition
var form = require('../includes/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#cart-form').length !== 0) {
    // HTML constructors
    var epreuveValidationWarning = $('#epreuve-validation-warning')

    // get cart
    var getSelectedEpreuve = require('../includes/createCart')

    // ajax
    var ajaxPostForm = require('../includes/ajaxCreateCart')

    $(() => {
      // ----
      // TRIGGER
      // ----
      $('.cart-trigger').on('change', (e) => {
        form = getSelectedEpreuve(form)
        form.data.participant.event = $('input[name=eventName]').val()

        // UX helper and alert
        if (form.data.cart.epreuve.length < 1 || form.data.cart.epreuve[0].qty === null) {
          epreuveValidationWarning.removeClass('hidde')
          $('#cart').addClass('disabled')
        } else if (form.data.cart.epreuve.length > 1) {
          epreuveValidationWarning.removeClass('hidde')
          $('#cart').addClass('disabled')
          window.alert("Vous ne pouvez vous inscrire qu'à une épreuve à la fois")
          epreuveValidationWarning.removeClass('hidde')
        } else {
          epreuveValidationWarning.addClass('hidde')
          $('#cart').removeClass('disabled')
        }
      })

      // ----
      // FORM POST
      // ----
      $(document).on('submit', '#cart-form', (e) => {
        ajaxPostForm(form)
        e.preventDefault()
      })
    })
  }
}

export default registrationValidation()
