var utf8 = require('../../format/utf8')
var birthdayFormat = require('../user/birthdayFormat')

module.exports = function Dossier (init) {
  this.DOSSIER = init.id
  this.NOM = (nom) => {
    if (nom !== null && nom !== undefined && nom !== '') {
      return utf8(nom.toUpperCase())
    } else {
      return ''
    }
  }
  this.PRENOM = (prenom) => {
    if (prenom !== null && prenom !== undefined && prenom !== '') {
      return utf8(prenom.toUpperCase())
    } else {
      return ''
    }
  }
  this.ADRESSE1 = (adresse1) => {
    var val = ''
    if (adresse1 !== undefined && adresse1 !== null && adresse1 !== '') {
      val = utf8(adresse1).split(',').join(' ')
    }
    return val
  }
  this.ADRESSE2 = (adresse2) => {
    var val = ''
    if (adresse2 !== undefined && adresse2 !== null && adresse2 !== '') {
      val = utf8(adresse2).split(',').join(' ')
    }
    return val
  }
  this.CODE = (codePostal) => {
    return Number(codePostal)
  }
  this.VILLE = (city) => {
    return utf8(city)
  }
  this.ETAT = ''
  this.PAYS = ''
  this.EMAIL = init.email || ''
  this.TEL = init.phone || ''
  this.SEXE = init.sex || ''
  this.NUMERO = 0
  this.HANDICAP = 'aucun handicap'
  this.LICENCE = init.licence || 'Non licencié'
  this.NAISSANCE = (format) => {
    if (format === 'gmcap') {
      if (init.dateNaissance !== undefined && init.dateNaissance !== null && init.dateNaissance !== '') {
        var birthday = birthdayFormat(init.dateNaissance)
        return birthday.anneeNaissance
      } else {
        return null
      }
    } else if (format === 'excel') {
      return init.dateNaissance
    }
  }
  this.ANNEE_NAISSANCE = (format) => {
    if (format === 'excel') {
      var birthday = birthdayFormat(init.dateNaissance)
      return birthday.anneeNaissance
    }
  }
  this.MOIS_NAISSANCE = (format) => {
    if (format === 'excel') {
      var birthday = birthdayFormat(init.dateNaissance)
      return birthday.moisNaissance
    }
  }
  this.JOURS_NAISSANCE = (format) => {
    if (format === 'excel') {
      var birthday = birthdayFormat(init.dateNaissance)
      return birthday.jourNaissance
    }
  }
  this.CATEGORIE = (categorie) => {
    if (categorie === "EA - École d'Athlétisme") {
      return 1 // EA
    } else if (categorie === 'PO - Poussins') {
      return 2 // PO
    } else if (categorie === 'BE - Benjamins') {
      return 3 // BE
    } else if (categorie === 'MI - Minimes') {
      return 4 // MI
    } else if (categorie === 'CA - Cadets') {
      return 5 // CA
    } else if (categorie === 'JU - Juniors') {
      return 6 // JU
    } else if (categorie === 'ES - Espoirs') {
      return 7 // ES
    } else if (categorie === 'SE - Seniors') {
      return 8 // SE
    } else if (categorie === 'V1 - Masters H et F') {
      return 9 // V1
    } else if (categorie === 'V2 - Masters H et F') {
      return 10 // V2
    } else if (categorie === 'V3 - Masters H et F') {
      return 11 // V3
    } else if (categorie === 'V4 - Masters H et F') {
      return 12 // V4
    } else if (categorie === 'V5 - Masters H et F') {
      return 13 // V5
    } else if (categorie === 'VE - Masters') {
      return ''
    } else if (categorie === 'BB - Baby Athlé') {
      return ''
    } else {
      return ''
    }
  }
  this.TEMPS = ''
  this.CLUB = utf8(init.team)
  this.CODECLUB = ''
  this.ORGANISME = (teamConfig, participantTeam) => {
    if (teamConfig === true) {
      return utf8(participantTeam + '-' + this.DOSSIER)
    } else {
      return ''
    }
  }
  this.NATION = ''
  this.COURSE = (produits) => {
    var courses = []
    var races = JSON.parse(JSON.stringify(produits))
    if (races.length >= 1) {
      races.forEach((produit) => {
        if (produit.race !== undefined && produit.race !== undefined && produit.race !== '') {
          courses.push(utf8(produit.race.name))
        }
      })
    }

    if (courses !== null && courses !== undefined && courses !== '') {
      return courses
    }
  }
  this.DISTANCE = (produits) => {
    var courses = []
    var races = JSON.parse(JSON.stringify(produits))
    if (races.length >= 1) {
      races.forEach((produit) => {
        if (produit.race !== undefined && produit.race !== undefined && produit.race !== '') {
          courses.push(utf8(produit.race.distance))
        }
      })
    }

    if (courses !== null && courses !== undefined && courses !== '') {
      if (courses.length >= 1) {
        return courses[0]
      }
    }
  }
  this.PAYE = (format, paiement) => {
    if (format === 'gmcap') {
      if (paiement.captured === true || paiement.other_captured === true) {
        return 'O'
      } else {
        return 'N'
      }
    } else if (format === 'excel') {
      if (paiement.captured === true) {
        return 'CB'
      } else if (paiement.other_captured === true) {
        return 'AUTRE'
      } else {
        return 'NON'
      }
    }
  }
  this.INVITE = 'N'
  this.ENVOICLASST = 'N'
  this.CERTIF_MEDICAL = (certificat) => {
    if (certificat === null || certificat === undefined || certificat === '') {
      return 'N'
    } else {
      return 'O'
    }
  }

  this.formatedDossied = (dossier) => {
    return {
      'DOSSIER': this.DOSSIER,
      'NOM': this.NOM(dossier.nom),
      'PRENOM': this.PRENOM(dossier.prenom),
      'ADRESSE1': this.ADRESSE1(dossier.adresse1),
      'ADRESSE2': this.ADRESSE2(dossier.adresse2),
      'CODE': this.CODE(dossier.codePostal),
      'VILLE': this.VILLE(dossier.city),
      'ETAT': this.ETAT,
      'PAYS': this.PAYS,
      'EMAIL': this.EMAIL,
      'TEL': this.TEL,
      'SEXE': this.SEXE,
      'NUMERO': this.NUMERO,
      'HANDICAP': this.HANDICAP,
      'LICENCE': this.LICENCE,
      'NAISSANCE': this.NAISSANCE(dossier.format),
      'ANNEE_NAISSANCE': this.ANNEE_NAISSANCE(dossier.format),
      'MOIS_NAISSANCE': this.MOIS_NAISSANCE(dossier.format),
      'JOURS_NAISSANCE': this.JOURS_NAISSANCE(dossier.format),
      'CATEGORIE': this.CATEGORIE(dossier.categorie),
      'TEMPS': this.TEMPS,
      'CLUB': this.CLUB,
      'CODECLUB': this.CODECLUB,
      'ORGANISME': this.ORGANISME(dossier.teamConfig, dossier.participantTeam),
      'NATION': this.NATION,
      'COURSE': this.COURSE(dossier.produits),
      'DISTANCE': this.DISTANCE(dossier.produits),
      'PAYE': this.PAYE(dossier.format, dossier.paiement),
      'INVITE': this.INVITE,
      'ENVOICLASST': this.ENVOICLASST,
      'CERTIF_MEDICAL': this.CERTIF_MEDICAL(dossier.certificat)
    }
  }
}
