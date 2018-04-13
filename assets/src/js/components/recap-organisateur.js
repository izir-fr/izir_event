var recap = () => {
  $('.other-captured').on('click', (e) => {
    var otherCheckout = window.confirm('Souhaitez-vous valider le paiement par chèque / espèce de cette inscription ?')
    if (!otherCheckout) {
      e.preventDefault()
    }
  })
}

export default recap()
