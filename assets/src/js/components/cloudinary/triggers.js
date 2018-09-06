import uploadAction from './modules/uploadAction'
import imgQuantityCheck from './modules/imgQuantityCheck'
import legalesQuantityCheck from './modules/legalesQuantityCheck'

// Export trigger
var fileUploader = () => {
  // verify document limite
  imgQuantityCheck()
  legalesQuantityCheck()
  // certificat trigger
  $(document).on('click', '.upload_certificats_opener', (e) => {
    uploadAction.certificatUploader(e)
  })
  $(document).on('click', '#upload_certificats_opener', (e) => {
    uploadAction.certificatUploader(e)
  })
  $(document).on('click', '.upload_certificats_opener_team', (e) => {
    uploadAction.certificatUploader(e)
  })
  $('#upload_images_opener').on('click', (e) => {
    uploadAction.imageUploader(e)
  })
  $('#upload_legales_opener').on('click', (e) => {
    uploadAction.legalesUploader(e)
  })
}

export default fileUploader()
