var raceDelete = () => {
  $('.race-delete').on('click', (e) => {
    var deleteRace = window.confirm('Souhaitez-vous supprimer cette épreuve ?')
    if (!deleteRace) {
      e.preventDefault()
    }
  })
}

export default raceDelete()
