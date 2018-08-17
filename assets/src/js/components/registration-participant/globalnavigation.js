var globalNav = () => {
  // ----
  // Step 2 participant to 1
  // ----

  $(document).on('click', '#epreuve-form-back', (e) => {
    $('#step-epreuve').removeClass('hidde')
    $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
    $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
    $('#step-participant').addClass('hidde')
  })

  // ----
  // Step 2 team to 1
  // ----

  $(document).on('click', '#epreuve-form-back-team', (e) => {
    $('input[name=teamActivate').val('false')
    $('#step-epreuve').removeClass('hidde')
    $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
    $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
    $('#step-team').addClass('hidde')
  })

  // ----
  // Step 3 to 2 particpant
  // ----

  $('#participant-form-back').on('click', (e) => {
    $('#header-confirmation').removeClass('txt-dark-blue').addClass('text-secondary')
    $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
    $('#step-confirmation').addClass('hidde')
    $('#step-participant').removeClass('hidde')
  })

  // ----
  // Step 3 to 2 team
  // ----

  $('#team-form-back').on('click', (e) => {
    $('#header-confirmation').removeClass('txt-dark-blue').addClass('text-secondary')
    $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
    $('#step-confirmation').addClass('hidde')
    $('#step-team').removeClass('hidde')
  })

  // ----
  // Step 3 to 4
  // ----

  $(document).on('change', $('#cgv'), () => {
    $('#done-validation-warning').removeClass('hidde')
    $('#checkout').addClass('disabled')

    if ($('#cgv').is(':checked')) {
      $('#done-validation-warning').addClass('hidde')
      $('#checkout').removeClass('disabled')
    }
  })
}

export default globalNav()
