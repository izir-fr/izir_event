var validation = () => {
  if ($('#certificat-team').length >= 1) {
    $(() => {
      if ($('input[name=certificat_validation]').length === $('.certificat_count').length) {
        $('#certificats_team_submit').removeClass('disabled')
      }
    })
  }
}

export default validation()
