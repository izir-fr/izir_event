var utf8 = require('./../../middleware/format/utf8')
var birthdayFormat = require('./../../middleware/app/user/birthdayFormat')

module.exports = function Dossier (init) {
  this.DOSSIER = init.id

  this.CART = init.cart

  this.EVENT = init.event

  this.FORMAT = init.format || null

  this.CART_BETA = init.cart_beta || false

  this.CART_AMOUT = init.orderAmount || null

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

  this.SEXE = () => {
    var sexe = init.sex || null
    var formatedSexe = ''
    if (sexe !== null) {
      formatedSexe = sexe.toLowerCase()
      if (formatedSexe === 'm' || formatedSexe === 'masculin' || formatedSexe === 'homme') {
        formatedSexe = 'M'
      } else if (formatedSexe === 'f' || formatedSexe === 'feminin' || formatedSexe === 'femme') {
        formatedSexe = 'F'
      }
    }
    return formatedSexe
  }

  this.NUMERO = 0

  this.HANDICAP = 'aucun handicap'

  this.LICENCE = init.licence || 'Non licencié'

  this.NAISSANCE = () => {
    if (this.FORMAT === 'gmcap' || this.FORMAT === 'web') {
      if (init.dateNaissance !== undefined && init.dateNaissance !== null && init.dateNaissance !== '') {
        var birthday = birthdayFormat(init.dateNaissance)
        return birthday.anneeNaissance
      } else {
        return null
      }
    } else if (this.FORMAT === 'excel') {
      return init.dateNaissance
    }
  }

  this.ANNEE_NAISSANCE = () => {
    if (this.FORMAT === 'excel') {
      var birthday = birthdayFormat(init.dateNaissance)
      return birthday.anneeNaissance
    }
  }

  this.MOIS_NAISSANCE = () => {
    if (this.FORMAT === 'excel') {
      var birthday = birthdayFormat(init.dateNaissance)
      return birthday.moisNaissance
    }
  }

  this.JOURS_NAISSANCE = () => {
    if (this.FORMAT === 'excel') {
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

  this.PRODUITS = JSON.parse(JSON.stringify(init.produits)) || null

  this.COURSE = () => {
    var courses = []
    var races = this.PRODUITS
    if (races.length >= 1) {
      races.forEach((produit) => {
        if (produit.race !== undefined && produit.race !== undefined && produit.race !== '') {
          if (this.FORMAT === 'web') {
            courses.push(produit.race)
          } else {
            courses.push(utf8(produit.race.name))
          }
        }
      })
    }

    if (courses !== null && courses !== undefined && courses !== '') {
      return courses
    }
  }

  this.DONS = () => {
    var dons = []
    var races = this.PRODUITS
    if (races.length >= 1) {
      races.forEach((produit) => {
        if (produit.race !== undefined && produit.race !== undefined && produit.race !== '') {
          if (produit.race.name === 'dons') {
            dons.push(produit)
          }
        }
      })
    }

    return dons
  }

  this.DISTANCE = () => {
    var courses = []
    var races = this.PRODUITS
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

  this.PAYE = (paiement) => {
    if (this.FORMAT === 'gmcap') {
      if (paiement.captured === true || paiement.other_captured === true) {
        return 'O'
      } else {
        return 'N'
      }
    } else if (this.FORMAT === 'excel') {
      if (paiement.captured === true) {
        return 'CB'
      } else if (paiement.other_captured === true) {
        return 'AUTRE'
      } else {
        return 'NON'
      }
    } else if (this.FORMAT === 'web') {
      if (paiement.captured === true || paiement.other_captured === true) {
        return {
          cb: paiement.captured,
          other_captured: paiement.other_captured
        }
      } else {
        return false
      }
    }
  }

  this.CONTACT = init.contact

  this.CONTACT_ID = init.contactId

  this.DOSSIER_VALIDATE = init.organisateur_validation

  this.ORDER_AMOUNT = () => {
    if (this.CART_BETA) {
      return this.CART_AMOUT
    } else {
      var cart = this.CART
      if (cart !== undefined && cart.products !== undefined) {
        if (cart.products.length >= 2) {
          var search = cart.products.find((query) => {
            if (String(query.event) === String(this.EVENT._id) && String(query.ref) === String(this.COURSE()[0]._id)) {
              return query
            }
          })
          if (search !== undefined) {
            return search.price
          }
        } else if (cart.products.length === 1) {
          return cart.products[0].price
        } else {
          return 0
        }
      } else {
        return 0
      }
    }
  }

  this.INVITE = 'N'

  this.ENVOICLASST = 'N'

  this.CERTIF_MEDICAL = (certificat) => {
    if (this.FORMAT === 'web') {
      if (certificat === null || certificat === undefined || certificat === '') {
        return false
      } else {
        return certificat
      }
    } else {
      if (certificat === null || certificat === undefined || certificat === '') {
        return 'N'
      } else {
        return 'O'
      }
    }
  }

  this.CREATED_AT = init.date

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
      'SEXE': this.SEXE(),
      'NUMERO': this.NUMERO,
      'CONTACT': this.CONTACT,
      'CONTACT_ID': this.CONTACT_ID,
      'HANDICAP': this.HANDICAP,
      'LICENCE': this.LICENCE,
      'NAISSANCE': this.NAISSANCE(),
      'ANNEE_NAISSANCE': this.ANNEE_NAISSANCE(),
      'MOIS_NAISSANCE': this.MOIS_NAISSANCE(),
      'JOURS_NAISSANCE': this.JOURS_NAISSANCE(),
      'CATEGORIE': this.CATEGORIE(dossier.categorie),
      'TEMPS': this.TEMPS,
      'CLUB': this.CLUB,
      'CODECLUB': this.CODECLUB,
      'ORGANISME': this.ORGANISME(dossier.teamConfig, dossier.participantTeam),
      'NATION': this.NATION,
      'PRODUITS': this.PRODUITS,
      'COURSE': this.COURSE(),
      'DONS': this.DONS(),
      'DISTANCE': this.DISTANCE(),
      'PAYE': this.PAYE(dossier.paiement),
      'INVITE': this.INVITE,
      'ENVOICLASST': this.ENVOICLASST,
      'ORDER_AMOUNT': this.ORDER_AMOUNT(),
      'CERTIF_MEDICAL': this.CERTIF_MEDICAL(dossier.certificat), // handlebarJS data
      'Certif Médical': this.CERTIF_MEDICAL(dossier.certificat), // Gmcap Data
      'DOSSIER_VALIDATE': this.DOSSIER_VALIDATE,
      'CREATED_AT': this.CREATED_AT
    }
  }
}
