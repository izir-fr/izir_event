var form = {
  option: {
    epreuve_format: {
      team: false,
      individuel: false
    },
    certificatValidation: false,
    formValidation: false,
    emailRegex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
    dateNow: new Date(Date.now()),
    team: {
      max: null,
      min: null
    }
  },
  data: {
    cart: {
      epreuve: [{
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
