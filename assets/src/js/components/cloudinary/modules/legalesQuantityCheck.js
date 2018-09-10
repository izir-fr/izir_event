var legalesQuantityCheck = () => {
  var legales = $('input[name=legales]')
  if (legales.length >= 1) {
    $('#upload_legales_opener').remove()
  }
}

export default legalesQuantityCheck
