// CLEAN OPTION FROM FORM TO ADD AND UPDATE PAGES
var cleanOptions = () => {
  for (var i = 0; i < $('#optionFrom').length; i++) {
    if ($('input[name=optionsRef]')[i].value === '' && $('input[name=optionsPrix]')[i].value === '') {
      $('#optionFrom')[i].remove()
    }
  }
}

var eventConfig = () => {
  $(() => {
    var epreuveForm = $('#epreuveBlankFrom').html()
    $('#epreuveBlankFrom').remove()
    var optionForm = $('#optionBlankFrom').html()
    $('#optionBlankFrom').remove()

    // clean options on page load
    cleanOptions()

    // ADD EPREUVES
    // Ajout infini d'épreuves
    $('#addEpreuve').on('click', (e) => {
      e.preventDefault()
      $('#epreuveAdd').append($('<div class="row bg-light mt-3"><div class="col-12">' + epreuveForm + '</div></div>'))
    })
    // Suppression d'épreuves
    $(document).on('click', '.delete-epreuve', (e) => {
      if ($('.delete-epreuve').length <= 1) {
        e.preventDefault()
        window.alert('Vous devez paramétrer minimum une épreuve pour votre évènement')
      } else {
        $(e.currentTarget).parents().get(7).remove()
      }
    })

    // ADD OPTIONS
    // Ajout infini d'options
    $('#addOption').on('click', (e) => {
      e.preventDefault()
      $('#optionAdd').append(optionForm)
    })

    // Suppression d'options
    $(document).on('click', '.delete-option', (e) => {
      $(e.currentTarget).parents().get(1).remove()
    })

    // confirmer la soumission du formulaire
    $('#postEvent').on('submit', (e) => {
      cleanOptions()
      var validation = window.confirm('Cliquez sur "OK" pour valider les informations ou "Annuler" pour les modifier')
      if (validation !== true) {
        e.preventDefault()
      }
    })
  })

  // affichage de la nouvelle adresse
  $('input#autocomplete').change(() => {
    $('input[name=adresse1]').attr({ 'type': 'text' })
    $('input[name=adresse2]').attr({ 'type': 'text' })
    $('input[name=ville]').attr({ 'type': 'text' })
    $('input[name=region]').attr({ 'type': 'text' })
    $('input[name=codePostal]').attr({ 'type': 'text' })
    $('input[name=pays]').attr({ 'type': 'text' })
  })
}

export default eventConfig()
