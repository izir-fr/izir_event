var addTeamMemberBtn = (maxVal) => {
  if ($('.team-count').length >= maxVal) {
    $('#add-team_member').remove()
  } else {
    $('#currentTeamLength').text($('.team-count').length)
  }
}

module.exports = addTeamMemberBtn
