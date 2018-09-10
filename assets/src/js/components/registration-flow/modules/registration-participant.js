var registrationValidation = () => {
  if ($('#participant-form').length !== 0) {
    $(() => {
      // ----
      // Step 3 to POST
      // ----
      $(document).on('submit', '#participant-form', (e) => {
        var validate = window.confirm('Souhaitez-vous valider ces informations ?')
        if (!validate) {
          e.preventDefault()
        }
      })
    })
  }
}

export default registrationValidation()
