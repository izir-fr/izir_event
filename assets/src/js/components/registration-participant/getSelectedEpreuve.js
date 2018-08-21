var epreuveValidationWarning = $('#epreuve-validation-warning')

// get selected event data for validation and recap
var getSelectedEpreuve = (form) => {
  var defautArray = {
    produit: null,
    qty: null,
    price: null,
    subTotal: null
  }

  form.data.cart.epreuve = []
  form.data.cart.options = []

  $('.epreuveInput').each((key, val) => {
    var produit = $($('.epreuve-validation')[key]).find('input[name=ref]')[0].value
    var qty = $($('.epreuve-validation')[key]).find('.quantityInput')[0].value
    var price = $($('.epreuve-validation')[key]).find('.tarifView')[0].innerText
    var subTotal = $($('.epreuve-validation')[key]).find('.subtotalView')[0].innerText
    epreuveValidationWarning.removeClass('hidde')

    var eventChoice = {
      produit: produit,
      qty: qty,
      price: price,
      subTotal: subTotal
    }

    if (eventChoice.subTotal > 0) {
      form.data.cart.epreuve.push(eventChoice)
    }
  })

  $('.option-validation').each((key, val) => {
    var produit = $($('.option-validation')[key]).find('input[name=ref]')[0].value
    var qty = $($('.option-validation')[key]).find('.quantityInput')[0].value
    var price = $($('.option-validation')[key]).find('.tarifView')[0].innerText
    var subTotal = $($('.option-validation')[key]).find('.subtotalView')[0].innerText

    var optionChoice = {
      produit: produit,
      qty: qty,
      price: price,
      subTotal: subTotal
    }

    if (optionChoice.subTotal > 0) {
      form.data.cart.options.push(optionChoice)
    }
  })

  if ($('.don').length >= 1) {
    form.data.cart.dons = $('.don')[0].value
  }

  form.data.cart.totalCart = $('#totalview').text()

  if (form.data.cart.epreuve.length === 0) {
    form.data.cart.epreuve.push(defautArray)
  } else {
    epreuveValidationWarning.addClass('hidde')
  }

  return form
}

module.exports = getSelectedEpreuve
