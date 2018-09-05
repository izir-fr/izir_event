// get selected event data for validation and recap
var getSelectedEpreuve = (form) => {
  var totalCart = 0
  var defautArray = {
    produit: null,
    qty: null,
    price: null,
    subTotal: null
  }

  form.data.cart.epreuve = []
  form.data.cart.options = []

  $('.epreuves').each((key, val) => {
    var produit = $(val).find('input[name=ref]')[0].value
    var qty = $(val).find('.quantity')[0].value
    var price = $(val).find('input[name=tarif]')[0].value
    var subTotal = qty * price
    $(val).find('.cart-subtotal').text(subTotal)

    var eventChoice = {
      produit: produit,
      qty: qty,
      price: price,
      subTotal: subTotal
    }

    totalCart += eventChoice.subTotal * 1

    if (eventChoice.subTotal > 0) {
      form.data.cart.epreuve.push(eventChoice)
    }
  })

  $('.options').each((key, val) => {
    var produit = $(val).find('input[name=ref]')[0].value
    var qty = $(val).find('input[name=quantity]')[0].value
    var price = $(val).find('input[name=tarif]')[0].value
    var subTotal = qty * price
    $(val).find('.cart-subtotal').text(subTotal)

    var optionChoice = {
      produit: produit,
      qty: qty,
      price: price,
      subTotal: subTotal
    }

    totalCart += optionChoice.subTotal * 1

    if (optionChoice.subTotal > 0) {
      form.data.cart.options.push(optionChoice)
    }
  })

  if ($('input[name=don]').length >= 1) {
    var don = $('input[name=don]').val() * 1
    form.data.cart.dons = don
    totalCart += don
  }

  $('#totalview')[0].innerHTML = totalCart
  form.data.cart.totalCart = totalCart

  if (form.data.cart.epreuve.length === 0) {
    form.data.cart.epreuve.push(defautArray)
  }

  return form
}

module.exports = getSelectedEpreuve
