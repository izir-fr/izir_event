var recap = () => {
  $('.other-captured').on('click', (e) => {
    var otherCheckout = window.confirm('Souhaitez-vous confirmer la réception du paiement par chèque / espèce de cette inscription ? La confirmatipon est définitive.')
    if (!otherCheckout) {
      e.preventDefault()
    }
  })
  $(() => {
    // affichage des dons
    if ($('input[name=dons]').val() === '') {
      $('#dons').remove()
    }

    $('.subtotal').each((key, val) => {
      if ($(val).text() * 1 <= 0) {
        $(val).parent().remove()
      }
    })

    $('.ref').each((key, val) => {
      var text = $(val).text().toLowerCase()
      if (text === 'don') {
        $(val).parent().remove()
      }
    })

    var dossierComplet = $('.complet').length
    $('#dossier_complet').text(dossierComplet)
  })
}

export default recap()
