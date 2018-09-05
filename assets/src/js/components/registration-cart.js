// form defaults options definition
var form = require('./registration-participant/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#cart-form').length !== 0) {
    // HTML constructors
    var epreuveValidationWarning = $('#epreuve-validation-warning')

    // get cart
    var getSelectedEpreuve = require('./registration-participant/getSelectedEpreuve')

    // ajax
    var ajaxPostForm = require('./registration-participant/ajaxCreateCart')

    $(() => {
      // Date limite verification
      var dateLimite = new Date($('input[name=dateLimite]').val())

      if (form.option.dateNow > dateLimite) {
        $('#registration-form').remove()
        $('#divForm').append('<div class="col-sm-12"><p class="alert alert-danger">La date limite d\'inscription à cette épreuve dépassée</p></div>')
      }

      // complete form.data.epreuve{}
      $('.cart-trigger').on('change', (e) => {
        form = getSelectedEpreuve(form)

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
      // Step 3 to POST
      // ----
      $(document).on('submit', '#cart-form', (e) => {
        ajaxPostForm(form)
        e.preventDefault()
      })
    })
  }
}

export default registrationValidation()
