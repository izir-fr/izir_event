$(function(){
  // => GENERAL SET UP
  var images = [],
      legales = [],
      certificats = [],
      cloud_name = 'eventizir',
      api_key  = 644512573537437,
      upload_preset = 'qwhsyols'
  // end setup

  // => IMAGES START
  //Ajout des images existantes à images[]
  if($('input[name=img]').length >= 1){
    $('input[name=img]').each(function(index, value){
      images.push($(this).val())
    })
    if(images.length>=3){
      $('#imagesButton>.cloudinary-button').addClass('hidde')
    }
  }

  //Ajout des images a cloudinary
  $('#upload_images_opener').cloudinary_upload_widget({
    cloud_name: cloud_name,
    api_key : api_key,
    upload_preset: upload_preset,
    folder: 'events_images',
    field_name :  'photo[]',
    max_files : 1},
    function(error, result) {
      $.each(result, function(index, value){
        //Vérification du dossier cible
        if(value.public_id.search("events_images") != -1){
          //création de l'URL et envoie dans images[]
          var imgUrl = "https://res.cloudinary.com/eventizir/image/upload/v" + value.version + "/" + value.public_id + ".jpg"
          images.push(imgUrl)

          //Supprimer .img du HTML existant
          $('.img').remove()

          //Injection des lien dans l'HTML
          $.each(images, function(index, value){
            $('#uploaded_images').append("<input class=\'form-control img\' name=\'img\' value=\'" + value + "\' type=\'hidden\'>")
          })
          if(images.length>=3){
            $('#imagesButton>.cloudinary-button').addClass('hidde')
          }
        }
      })
      //console.log(images)
    });
  //images end

  // => REGLEMENT START
  //Ajout des certificats existantes à images[]
  if($('input[name=legales]').length >= 1){
    $('input[name=legales]').each(function(index, value){
      legales.push($(this).val())
    })
    if(legales.length>=1){
      $('#legalesButton>.cloudinary-button').addClass('hidde')
    }
  }

  //Ajout du règlement a cloudinary
  $('#upload_legales_opener').cloudinary_upload_widget({
    cloud_name: cloud_name,
    api_key : api_key,
    upload_preset: upload_preset,
    folder: 'legales_documents',
    field_name :  'photo[]',
    max_files : 1},
    function(error, result) {
      $.each(result, function(index, value){
        //Vérification du dossier cible
        if(value.public_id.search("legales_documents") != -1){
          //création de l'URL et envoie dans images[]
          var certificatUrl = "https://res.cloudinary.com/eventizir/image/upload/v" + value.version + "/" + value.public_id + ".pdf"
          legales = []
          legales.push(certificatUrl)

          //Supprimer .img du HTML existant
          $('.legales').remove()

          //Injection des lien dans l'HTML
          $.each(legales, function(index, value){
            $('#uploaded_legales').append("<input class=\'form-control legales\' name=\'legales\' value=\'" + value + "\' type=\'hidden\'>")
            $('#uploaded_legales').append("<a class='legales' href='" + value + "' target='_blank'>Voir le règlement</a>")
          })
          if(legales.length>=1){
            $('#legalesButton>.cloudinary-button').addClass('hidde')
          }
        }
      })
      //console.log(legales)
    });
  //règlement end


  // => DISPLAY SET UP
  //default button
  $('.cloudinary-button').text("Ajouter des fichiers")

  //règlement boutton
  if($('input[name=legales]').length === 0 ) {
    $('span#legalesButton .cloudinary-button').text("Ajouter le règlement")
  } else {
    $('span#legalesButton .cloudinary-button').text("Modifier le règlement")
  }

  //images button
  if ($('span#imagesButton .cloudinary-button')) {
    $('span#imagesButton .cloudinary-button').text("Ajouter une photo, image, logo")
  }
})