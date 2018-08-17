var formParticipantData = () => {
  var nom = $('input[name=surname]')
  var prenom = $('input[name=name]')
  var email = $('input[name=email]')
  var jourNaissance = $('#jourNaissance')
  var moisNaissance = $('#moisNaissance')
  var anneeNaissance = $('input[name=anneeNaissance]')
  var team = $('input[name=team]')
  var sex = $('#sex')
  var numLicence = $('input[name=numLicence]')
  var categorie = $('#categorie')
  var event = $('input[name=eventName]')
  var adresse1 = $('input[name=adresse1]')
  var adresse2 = $('input[name=adresse2]')
  var codePostal = $('input[name=codePostal]')
  var city = $('input[name=city]')
  var certificat = $('input[name=certificat_file]')

  return {
    nom: nom,
    prenom: prenom,
    email: email,
    jourNaissance: jourNaissance,
    moisNaissance: moisNaissance,
    anneeNaissance: anneeNaissance,
    team: team,
    sex: sex,
    numLicence: numLicence,
    categorie: categorie,
    event: event,
    adresse1: adresse1,
    adresse2: adresse2,
    codePostal: codePostal,
    city: city,
    certificat: certificat
  }
}

module.exports = formParticipantData
