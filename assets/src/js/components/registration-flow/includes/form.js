var form = {
  option: {
    epreuve_format: {
      team: false,
      individuel: false
    },
    team: {
      max: null,
      min: null
    }
  },
  data: {
    cart: {
      epreuve: [{
        id: null,
        produit: null,
        qty: null,
        price: null,
        subTotal: null
      }],
      options: [],
      dons: null,
      totalCart: null
    },
    participant: {},
    team: {}
  }
}

module.exports = form
