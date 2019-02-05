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

    var cartAction = (e) => {
      // get form
      form = getSelectedEpreuve(form)
      // form.data.participant.event = $('input[name=eventName]').val()
      var config = {
        helper: false
      }

      // form validation
      if (form.data.cart.epreuve.length < 1 || form.data.cart.epreuve[0].qty === null) {
        config.helper = true
      } else if (form.data.cart.epreuve.length > 1) {
        config.helper = true
        window.alert("Vous ne pouvez vous inscrire qu'à une épreuve à la fois")
        e.currentTarget.value = 0
      } else {
        config.helper = false
      }

      // UX helper and alert
      if (config.helper === true) {
        epreuveValidationWarning.removeClass('hidde')
        $('#cart').addClass('disabled')
      } else {
        epreuveValidationWarning.addClass('hidde')
        $('#cart').removeClass('disabled')
      }

      // form after validation
      form = getSelectedEpreuve(form)
    }

    $(() => {
      // init on page load
      cartAction()

      // ----
      // TRIGGER
      // ----
      $('.cart-trigger').on('change', (e) => {
        cartAction(e)
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
