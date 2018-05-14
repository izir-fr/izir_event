var fileUploader = () => {
  // $(() => {
  //   // => GENERAL SET UP
  //   var images = []
  //   var legales = []
  //   var certificats = []
  //   var cloudName = 'eventizir'
  //   var cloudinaryKey = 644512573537437
  //   var uploadPreset = 'qwhsyols'
  //   // end setup

  //   // => IMAGES START
  //   // Ajout des images existantes à images[]
  //   if ($('input[name=img]').length >= 1) {
  //     $('input[name=img]').each((index, value) => {
  //       images.push($(this).val())
  //     })
  //     if (images.length >= 3) {
  //       $('#imagesButton>.cloudinary-button').addClass('hidde')
  //     }
  //   }

  //   // Ajout des images a cloudinary
  //   $('#upload_images_opener').cloudinary_upload_widget({
  //     cloud_name: cloudName,
  //     api_key: cloudinaryKey,
  //     upload_preset: uploadPreset,
  //     folder: 'events_images',
  //     field_name: 'photo[]',
  //     max_files: 1},
  //   (error, result) => {
  //     $.each(result, (index, value) => {
  //       // Vérification du dossier cible
  //       if (value.public_id.search('events_images') !== -1) {
  //         // création de l'URL et envoie dans images[]
  //         var imgUrl = 'https://res.cloudinary.com/eventizir/image/upload/v' + value.version + '/' + value.public_id + '.jpg'
  //         images.push(imgUrl)

  //         // Supprimer .img du HTML existant
  //         $('.img').remove()

  //         // Injection des lien dans l'HTML
  //         $.each(images, (index, value) => {
  //           $('#uploaded_images').append('<input class="form-control img" name="img" value="' + value + '" type="hidden">')
  //         })
  //         if (images.length >= 3) {
  //           $('#imagesButton>.cloudinary-button').addClass('hidde')
  //         }
  //       }
  //     })
  //     console.log(error)
  //   })
  //   // images end

  //   // => REGLEMENT START
  //   // Ajout des certificats existantes à images[]
  //   if ($('input[name=legales]').length >= 1) {
  //     $('input[name=legales]').each((index, value) => {
  //       legales.push($(this).val())
  //     })
  //     if (legales.length >= 1) {
  //       $('#legalesButton>.cloudinary-button').addClass('hidde')
  //     }
  //   }

  //   // Ajout du règlement a cloudinary
  //   $('#upload_legales_opener').cloudinary_upload_widget({
  //     cloud_name: cloudName,
  //     api_key: cloudinaryKey,
  //     upload_preset: uploadPreset,
  //     folder: 'legales_documents',
  //     field_name: 'photo[]',
  //     max_files: 1},
  //   (error, result) => {
  //     $.each(result, (index, value) => {
  //       // Vérification du dossier cible
  //       if (value.public_id.search('legales_documents') !== -1) {
  //         // création de l'URL et envoie dans images[]
  //         var certificatUrl = 'https://res.cloudinary.com/eventizir/image/upload/v' + value.version + '/' + value.public_id + '.pdf'
  //         legales = []
  //         legales.push(certificatUrl)

  //         // Supprimer .img du HTML existant
  //         $('.legales').remove()

  //         // Injection des lien dans l'HTML
  //         $.each(legales, (index, value) => {
  //           $('#uploaded_legales').append('<input class="form-control legales" name="legales" value="' + value + '" type="hidden">')
  //           $('#uploaded_legales').append("<a class='legales' href='" + value + "' target='_blank'>Voir le règlement</a>")
  //         })
  //         if (legales.length >= 1) {
  //           $('#legalesButton>.cloudinary-button').addClass('hidde')
  //         }
  //       }
  //     })
  //     console.log(error)
  //   })
  //   // règlement end

  //   // => CERTIFICATS
  //   // Ajout des certificat a cloudinary
  //   $('#upload_certificats_opener').cloudinary_upload_widget({
  //     cloud_name: cloudName,
  //     api_key: cloudinaryKey,
  //     upload_preset: uploadPreset,
  //     folder: 'certificats_documents',
  //     field_name: 'photo[]',
  //     max_files: 1},
  //   (err, res) => {
  //     console.log(err)
  //   })

  //   // Remonté des URL de certificat
  //   $(document).on('cloudinarywidgetfileuploadsuccess', (e, data) => {
  //     var validation = data.public_id.search('certificats_documents')
  //     var validationFalse = -1
  //     if (validation > validationFalse) {
  //       certificats.push(data.secure_url)
  //       $('.certificats').remove()
  //       $('#old_certificat').remove()
  //       $('.cloudinary-thumbnails').remove()

  //       if ($('#certificat_upload_page').length === 1) {
  //         $('input[name=month]').val('')
  //         $('input[name=year]').val('')
  //       }

  //       for (var i = 0; i < certificats.length; i++) {
  //         var certificat = '<input class="form-control certificats" name="certificats" value="' + certificats[i] + '" type="hidden">'
  //         $('#uploaded_certificats').append(certificat)
  //         $('input[name=certificatCondition]').prop('disabled', false)
  //       }
  //       if ($('.certificats').length >= 1) {
  //         $('#certificatButton>.cloudinary-button').remove()
  //         $('#certificatCheckbox').removeClass('hidde')
  //       }
  //     }
  //   })
  //   // certificat end

  //   // => DISPLAY SET UP
  //   // default button
  //   $('.cloudinary-button').text('Ajouter des fichiers')

  //   // règlement boutton
  //   if ($('input[name=legales]').length === 0) {
  //     $('span#legalesButton .cloudinary-button').text('Ajouter le règlement')
  //   } else {
  //     $('span#legalesButton .cloudinary-button').text('Modifier le règlement')
  //   }

  //   // images button
  //   if ($('span#imagesButton .cloudinary-button')) {
  //     $('span#imagesButton .cloudinary-button').text('Ajouter une photo, image, logo')
  //   }
  // })
}

export default fileUploader()
