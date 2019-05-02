module.exports = (birthday) => {
  var result = {
    jourNaissance: '',
    moisNaissance: '',
    anneeNaissance: ''
  }
  if (birthday !== undefined && birthday !== null) {
    if (birthday.split('/').length === 3) {
      result.jourNaissance = birthday.split('/')[0]
      result.moisNaissance = birthday.split('/')[1]
      result.anneeNaissance = birthday.split('/')[2]
    }
  }

  return result
}
