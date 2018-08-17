var confirmationProduitConstructor = (val) => {
  return '<div class="row confirmationProduit">' +
    '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + val.produit + '</div>' +
    '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + val.qty + '</div>' +
    '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + val.price + '€</div>' +
    '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + val.subTotal + '€</div>' +
  '</div>'
}

module.exports = confirmationProduitConstructor
