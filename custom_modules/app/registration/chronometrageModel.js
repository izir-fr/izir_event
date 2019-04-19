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
    return utf8(adresse1)
  }
  this.ADRESSE2 = (adresse2) => {
    return utf8(adresse2)
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
  this.NUMERO = ''
  this.HANDICAP = ''
  this.LICENCE = init.licence || ''
  this.NAISSANCE = init.dateNaissance
  this.ANNEE_NAISSANCE = () => {
    var birthday = birthdayFormat(this.NAISSANCE)
    return birthday.anneeNaissance
  }
  this.MOIS_NAISSANCE = () => {
    var birthday = birthdayFormat(this.NAISSANCE)
    return birthday.moisNaissance
  }
  this.JOURS_NAISSANCE = () => {
    var birthday = birthdayFormat(this.NAISSANCE)
    return birthday.jourNaissance
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
    produits.forEach((produit) => {
      if (produit.produitsQuantite > 0 && produit.produitsRef !== 'don') {
        if (produit.race !== undefined) {
          courses.push(utf8(produit.race.name))
        } else {
          courses.push(utf8(produit.produitsRef))
        }
      }
    })
    return courses
  }
  this.DISTANCE = ''
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
      'NAISSANCE': this.NAISSANCE,
      'ANNEE_NAISSANCE': this.ANNEE_NAISSANCE(),
      'MOIS_NAISSANCE': this.MOIS_NAISSANCE(),
      'JOURS_NAISSANCE': this.JOURS_NAISSANCE(),
      'CATEGORIE': this.CATEGORIE(dossier.categorie),
      'TEMPS': this.TEMPS,
      'CLUB': this.CLUB,
      'CODECLUB': this.CODECLUB,
      'ORGANISME': this.ORGANISME(dossier.teamConfig, dossier.participantTeam),
      'NATION': this.NATION,
      'COURSE': this.COURSE(dossier.produits),
      'DISTANCE': this.DISTANCE,
      'PAYE': this.PAYE(dossier.format, dossier.paiement),
      'INVITE': this.INVITE,
      'ENVOICLASST': this.ENVOICLASST,
      'CERTIF_MEDICAL': this.CERTIF_MEDICAL(dossier.certificat)
    }
  }
}
