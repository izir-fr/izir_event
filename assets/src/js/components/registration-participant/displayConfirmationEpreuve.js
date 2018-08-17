var confirmationProduitConstructor = require('./confirmationProduitConstructor')

// get confirmation épreuves
var displayConfirmationEpreuve = (form) => {
  if ($('.confirmationProduit').length >= 1) {
    $('.confirmationProduit').each((key, val) => {
      $(val).remove()
    })
  }

  form.data.cart.epreuve.forEach((val) => {
    $('#confirmation-epreuve').append(
      confirmationProduitConstructor(val)
    )
  })

  if (form.data.cart.options.length > 0) {
    form.data.cart.options.forEach((val) => {
      $('#confirmation-epreuve').append(
        confirmationProduitConstructor(val)
      )
    })
  }

  if (form.data.cart.dons !== null) {
    var dons = {
      produit: 'Dons',
      qty: 1,
      price: form.data.cart.dons,
      subTotal: form.data.cart.dons
    }
    $('#confirmation-epreuve').append(
      confirmationProduitConstructor(dons)
    )
  }

  $('#confirmation-total').text(form.data.cart.totalCart + '€')
}

module.exports = displayConfirmationEpreuve
