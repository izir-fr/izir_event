// form defaults options definition
var form = require('../includes/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#team-form').length !== 0) {
    // HTML constructors
    var teamMemberForm = $('#team-member')[0].outerHTML

    // get team form and next functions
    var addTeamMemberBtn = require('../includes/addTeamMemberBtn')
    // var teamVerification = require('./includes/teamVerification')
    // var teamFormValidation = require('../includes/teamFormValidation')
    // var teamCertificatValidation = require('./includes/teamCertificatValidation')
    // var teamFormDone = require('../includes/teamFormDone')

    $(() => {
      form.option.team.max = $('input[name=team_max]').val()
      form.option.team.min = $('input[name=team_min]').val()
      // ----
      // Step 2 TEAMMATE add
      // ----

      $(document).on('click', '#add-team_member', (e) => {
        console.log(form)
        $('#new-team-block').append(teamMemberForm)
        addTeamMemberBtn(form.option.team.max)
      })

      // $(document).on('change', '.input-team-validation', (e) => {
      //   form = teamFormValidation(form)
      //   form = teamCertificatValidation(form)
      //   teamFormDone(form)
      // })

      // ----
      // SUBMIT FORM
      // ----
      $(document).on('submit', '#team-form', (e) => {
        var validate = window.confirm('Souhaitez-vous valider ces informations ?')
        if (!validate) {
          e.preventDefault()
        }
      })
    })
  }
}

export default registrationValidation()
