var imgQuantityCheck = () => {
  var imageFiles = $('input[name=img]')
  if (imageFiles.length >= 3) {
    $('#upload_images_opener').remove()
  }
}

export default imgQuantityCheck
