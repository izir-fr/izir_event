var teamVerification = (form) => {
  var team = 0
  $('.subtotalInput').each((key, val) => {
    if ($(val).hasClass('teamActivate') === true && Number($(val).val()) > 0) {
      form.option.team.min = $($(val).parent().get(0)).find('input[name=team_min]').val()
      form.option.team.max = $($(val).parent().get(0)).find('input[name=team_max]').val()

      team += 1
    }
  })
  if (team > 0) {
    form.option.epreuve_format.team = true
    form.option.epreuve_format.individuel = false
  } else {
    form.option.epreuve_format.team = false
    form.option.epreuve_format.individuel = true
  }

  return form
}

module.exports = teamVerification
