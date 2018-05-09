var eventDetail = () => {
  $(() => {
    if ($('input[name=dateClotureInscription]').length !== 0) {
      var dateNow = new Date(Date.now())
      var eventDate = new Date($('input[name=dateClotureInscription]').val())
      if (dateNow > eventDate) {
        $('#inscriptionButton').remove()
        $('#date-info').text('Les inscriptions sont cloturées').addClass('badge-danger').removeClass('badge-warning')
      }
    }
  })
}
export default eventDetail()
