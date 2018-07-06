var registrationToTeam = (array) => {
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
          }
        }

        // export team member formated
        inscriptions.push(teamMemberRegistration)
      })
    } else {
      inscriptions.push(val)
    }
  })

  return inscriptions
}

module.exports = registrationToTeam
