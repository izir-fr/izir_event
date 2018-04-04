$(function(){
  var epreuveForm = $('#epreuveBlankFrom').html()
  $('#epreuveBlankFrom').remove()
  var optionForm = $('#optionBlankFrom').html()
  $('#optionBlankFrom').remove()

  //CLEAN OPTION FROM FORM TO ADD AND UPDATE PAGES
  for( var i = 0; i < $('#optionFrom').length; i++ ) {
    if( $('input[name=optionsRef]')[i].value === "" && $('input[name=optionsPrix]')[i].value === ""){
      $('#optionFrom')[i].remove()
    }
  }

  //ADD EPREUVES
  //Ajout infini d'épreuves
  $('#addEpreuve').on('click', function(e){
    e.preventDefault()
    $('#epreuveAdd').append($("<div><div class='text-center'><strong>////////////////////// NOUVELLE EPREUVE //////////////////////</strong></div>"+ epreuveForm + "</div>"))
  });
  //Suppression d'épreuves
  $(document).on('click','.delete-epreuve',function(e) {
    if($('.delete-epreuve').length <= 1){
      e.preventDefault()
      alert("Vous devez paramétrer minimum une épreuve pour votre évènement")
      } else {
      $(this).parents().get(6).remove()
    }
  });

  //ADD OPTIONS
  //Ajout infini d'options
  $('#addOption').on('click', function(e){
    e.preventDefault()
    var setId = $('input[name=optionsRef]').length
    $('#optionAdd').append(optionForm)
  });

  //Suppression d'options
  $(document).on('click','.delete-option',function() {
    $(this).parents().get(1).remove();
  });

  //confirmer la soumission du formulaire
  $("#postEvent").on('sumbimt',function(e) {
    
    if($('input[name=CGV]').is(':checked') === false) {
      alert('Merci de la cocher la case de conditions générales de vente pour continuer')
       e.preventDefault()
    } else {
      var validation = confirm('Cliquez sur "OK" pour valider les informations ou "Annuler" pour les modifier')
      if ( validation !== true ){
          e.preventDefault()
        }
      }
  });
})