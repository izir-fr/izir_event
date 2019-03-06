var quantityChange = () => {
  $('input[name=quantity]').on('change', (e) => {
    $(e.target.parentElement[1]).addClass('d-inline-block').removeClass('d-none')
    $('#button-next').addClass('disabled')
    $('#helper').text('Merci de valider la quantité qui a été modifiée pour pouvoir continuer').addClass('alert').addClass('alert-warning')
  })
}

module.exports = quantityChange()
