import uploadAction from '../../cloudinary/modules/uploadAction'

var initStyleAction = () => {
  // init certificat_viewer style
  $('#certificat_viewer').addClass('disabled')
  $('#certificat_viewer').addClass('btn-outline-secondary')
  $('#certificat_viewer').removeClass('btn-success')
  // init btn and input value
  $('#certificat_viewer').attr('href', '')
  $('input[name=certificat_file]').val('')
}

var addCertificatFileLink = (certificat) => {
  $('input[name=certificat_file]').val(certificat)
  $('#certificat_viewer').attr('href', certificat)
}

var finalStyleAction = () => {
  if ($('input[name=certificat_file]').val() !== '' && $('input[name=certificat_file]').val() !== undefined && $('input[name=certificat_file]').val() !== null) {
    // certificat_viewer action style
    $('#certificat_viewer').removeClass('disabled')
    $('#certificat_viewer').removeClass('btn-outline-secondary')
    $('#certificat_viewer').addClass('btn-success')
  }
}

if ($('#certificat-form').length >= 1) {
  $(document).on('click', '#user_certificat', (e) => {
    initStyleAction()
    // certificat btn and input completion
    var certificat = $('input[name=user_certificat_document]').val()
    addCertificatFileLink(certificat)
    finalStyleAction()
  })

  $(document).on('click', '#upload_cart_certificats_opener', (e) => {
    initStyleAction()
    uploadAction.cartCertificatUploader(e, (doc) => {
      if (doc !== '' && doc !== undefined && doc !== null) {
        var certificat = doc
        addCertificatFileLink(certificat)
        finalStyleAction()
      } else {
        window.alert('Une erreur est survenue lors du téléchargement de votre document, merci de réessayer.')
      }
    }, (err) => {
      if (err) {
        window.alert('Une erreur est survenue lors du téléchargement de votre document, merci de réessayer.')
      }
    })
  })

  $(document).on('submit', '#certificat-form', (e) => {
    var certificat = $('input[name=certificat_file]').val()
    console.log(certificat)
    if (certificat === '' || certificat === undefined || certificat === null) {
      window.alert('Votre certificat n\'est pas conforme')
      e.preventDefault()
    } else {
      var validate = window.confirm('Souhaitez-vous valider ce document?')
      if (!validate) {
        e.preventDefault()
      }
    }
  })
}
