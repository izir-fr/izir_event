var utf8 = (val) => {
  if (val) {
    return decodeURIComponent(val)
  } else {
    return ''
  }
}

var exportModules = {
  registrationToTeam: (array) => {
    var inscriptions = []

    array.forEach((val) => {
      if (val.team && val.team.length >= 1) {
        var teamMemberRegistration

        val.team.forEach((member) => {
          teamMemberRegistration = {
            // member registration format
            id: val.id,
            event: val.event,
            eventName: val.eventName,
            produits: val.produits,
            orderAmount: val.orderAmount,
            statut: val.statut,
            paiement: val.paiement,
            created_at: val.created_at,
            updated: val.updated,

            // member registration format participant
            participant: {
              team: val.participant.team,
              codePostal: val.participant.codePostal,
              city: val.participant.city,
              nom: member.nom,
              prenom: member.prenom,
              sex: member.sex,
              dateNaissance: member.dateNaissance,
              numLicence: member.numLicence,
              email: member.email
            },
            docs: {
              certificat: member.docs.certificat
            },
            team: true
          }

          // export team member formated
          inscriptions.push(teamMemberRegistration)
        })
      } else {
        inscriptions.push(val)
      }
    })

    return inscriptions
  },
  inscriptionSetup: (format, val) => {
    var courses = []
    var nom,
      paiement,
      certificat,
      categorie,
      cleanNaissance,
      dateNaissance,
      organisme

    // setup nom
    if (val.participant.nom !== null && val.participant.nom !== undefined && val.participant.nom !== '') {
      nom = val.participant.nom.toUpperCase()
    } else {
      nom = ''
    }

    // année de naissance setup
    if (val.participant.dateNaissance !== undefined && val.participant.dateNaissance !== null) {
      cleanNaissance = val.participant.dateNaissance.split('/')
      if (cleanNaissance.length === 3) {
        dateNaissance = {
          annee: cleanNaissance[2],
          mois: cleanNaissance[1],
          jour: cleanNaissance[0]
        }
      } else {
        dateNaissance = {
          annee: cleanNaissance,
          mois: '',
          jour: ''
        }
      }
    } else {
      dateNaissance = {
        annee: '',
        mois: '',
        jour: ''
      }
    }

    // epreuve setup
    val.produits.forEach((val) => {
      if (val.produitsQuantite > 0 && val.produitsRef !== 'don') {
        courses.push(val.produitsRef)
      }
    })

    // paiement setup
    if (format === 'gmcap') {
      if (val.paiement.captured === true || val.paiement.other_captured === true) {
        paiement = 'O'
      } else {
        paiement = 'N'
      }
    } else if (format === 'excel') {
      if (val.paiement.captured === true) {
        paiement = 'CB'
      } else if (val.paiement.other_captured === true) {
        paiement = 'AUTRE'
      } else {
        paiement = 'NON'
      }
    }

    // certificat medical setup
    if (val.docs.certificat === null || val.docs.certificat === undefined || val.docs.certificat === '') {
      certificat = 'N'
    } else {
      certificat = 'O'
    }

    // organisme setup
    if (val.team === true) {
      organisme = val.participant.team + '-' + val.id
    } else {
      organisme = ''
    }

    // categorie setup
    if (val.participant.categorie === "EA - École d'Athlétisme") {
      categorie = 1 // EA
    } else if (val.participant.categorie === 'PO - Poussins') {
      categorie = 2 // PO
    } else if (val.participant.categorie === 'BE - Benjamins') {
      categorie = 3 // BE
    } else if (val.participant.categorie === 'MI - Minimes') {
      categorie = 4 // MI
    } else if (val.participant.categorie === 'CA - Cadets') {
      categorie = 5 // CA
    } else if (val.participant.categorie === 'JU - Juniors') {
      categorie = 6 // JU
    } else if (val.participant.categorie === 'ES - Espoirs') {
      categorie = 7 // ES
    } else if (val.participant.categorie === 'SE - Seniors') {
      categorie = 8 // SE
    } else if (val.participant.categorie === 'V1 - Masters H et F') {
      categorie = 9 // V1
    } else if (val.participant.categorie === 'V2 - Masters H et F') {
      categorie = 10 // V2
    } else if (val.participant.categorie === 'V3 - Masters H et F') {
      categorie = 11 // V3
    } else if (val.participant.categorie === 'V4 - Masters H et F') {
      categorie = 12 // V4
    } else if (val.participant.categorie === 'V5 - Masters H et F') {
      categorie = 13 // V5
    } else if (val.participant.categorie === 'VE - Masters') {
      categorie = ''
    } else if (val.participant.categorie === 'BB - Baby Athlé') {
      categorie = ''
    } else {
      categorie = ''
    }

    // génération de l'inscription
    return {
      'DOSSIER': val.id,
      'NOM': utf8(nom),
      'PRENOM': utf8(val.participant.prenom),
      'ADRESSE1': utf8(val.participant.adresse1),
      'ADRESSE2': utf8(val.participant.adresse2),
      'CODE': val.participant.codePostal,
      'VILLE': utf8(val.participant.city),
      'ETAT': '',
      'PAYS': '',
      'EMAIL': val.participant.email,
      'TEL': val.phone,
      'SEXE': val.participant.sex,
      'NUMERO': '',
      'HANDICAP': '',
      'LICENCE': val.participant.numLicence,
      'NAISSANCE': dateNaissance.annee,
      'ANNEE_NAISSANCE': dateNaissance.annee,
      'MOIS_NAISSANCE': dateNaissance.mois,
      'JOURS_NAISSANCE': dateNaissance.jour,
      'CATEGORIE': categorie,
      'TEMPS': '',
      'CLUB': utf8(val.participant.team),
      'CODECLUB': '',
      'ORGANISME': utf8(organisme),
      'NATION': '',
      'COURSE': utf8(courses),
      'DISTANCE': val.distance,
      'PAYE': paiement,
      'INVITE': 'N',
      'ENVOICLASST': 'N',
      'CERTIF MEDICAL': certificat
    }
  }
}

module.exports = exportModules
