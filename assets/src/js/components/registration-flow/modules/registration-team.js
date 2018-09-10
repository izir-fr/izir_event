// form defaults options definition
var form = require('../includes/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#team-form').length !== 0) {
    // HTML constructors
    var teamMemberForm = $('#team-member')[0].outerHTML

    // get team form and next functions
    var addTeamMemberBtn = require('../includes/addTeamMemberBtn')

    $(() => {
      form.option.team.max = $('input[name=team_max]').val() * 1
      form.option.team.min = $('input[name=team_min]').val() * 1

      // edit form min count
      if ($('.team-count').length < form.option.team.min) {
        for (var i = $('.team-count').length; i < form.option.team.min; i++) {
          $('#new-team-block').append(teamMemberForm)
        }
      }

      // edit button add count
      $('#currentTeamLength').text($('.team-count').length)
      $('#maxTeamLength').text(form.option.team.max)
      $('#option-team-min').text(form.option.team.min)

      // ----
      // Step 2 TEAMMATE add
      // ----

      $(document).on('click', '#add-team_member', (e) => {
        $('#currentTeamLength').text($('.team-count').length)
        $('#new-team-block').append(teamMemberForm)
        addTeamMemberBtn(form.option.team.max)
      })

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
