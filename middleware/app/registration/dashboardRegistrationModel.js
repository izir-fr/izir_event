module.exports = function Dashboard (init) {
  this.inscriptions = init
  this.tableauDons = () => {
    var tableauFinal = []

    if (this.inscriptions.length >= 1 && this.inscriptions !== undefined && this.inscriptions !== null) {
      this.inscriptions.forEach((inscription) => {
        if (inscription.DONS.length >= 1) {
          inscription.DONS.forEach((don) => {
            tableauFinal.push(don)
          })
        }
      })
    }
    return tableauFinal
  }
  this.tableauPaiements = () => {
    var inscriptions = this.inscriptions
    var tableauxFinaux = {
      dossiers: inscriptions,
      dossiersDone: [],
      paiements_all: [],
      paiements_cb: [],
      total: {
        paiements_all: null,
        paiements_cb: null
      }
    }

    if (inscriptions.length >= 1) {
      inscriptions.forEach((registration) => {
        var alreadyExist = tableauxFinaux.dossiersDone.find((query) => {
          if (registration.DOSSIER === query) {
            return true
          }
        })

        if (!alreadyExist) {
          // filtre uniquement les dosssiers payés, en cb et chèques
          if (registration.PAYE.cb === true || registration.PAYE.other_captured === true) {
            tableauxFinaux.paiements_all.push(registration.ORDER_AMOUNT)
          }
          // filtre uniquement les dossiers cb
          if (registration.PAYE.cb === true) {
            tableauxFinaux.paiements_cb.push(registration.ORDER_AMOUNT)
          }
          tableauxFinaux.dossiersDone.push(registration.DOSSIER)
        }
      })
    }

    tableauxFinaux.total.paiements_all = tableauxFinaux.paiements_all.reduce((acc, curr) => {
      return acc + curr
    }, 0)
    tableauxFinaux.total.paiements_cb = tableauxFinaux.paiements_cb.reduce((acc, curr) => {
      return acc + curr
    }, 0)

    return tableauxFinaux
  }
  this.dossiersValides = () => {
    var dossiers = 0
    var inscriptions = this.inscriptions
    if (inscriptions.length >= 1 && inscriptions !== undefined) {
      inscriptions.forEach((inscription) => {
        var testPaiement, testCertificat
        if (inscription.PAYE.captured === true || inscription.PAYE.other_captured === true) {
          testPaiement = true
        } else {
          testPaiement = false
        }

        if (inscription.CERTIF_MEDICAL !== '' && inscription.CERTIF_MEDICAL !== undefined && inscription.CERTIF_MEDICAL !== null) {
          testCertificat = true
        } else {
          testCertificat = false
        }

        if (testPaiement === true && testCertificat === true) {
          dossiers++
        }
      })
    }
    return dossiers
  }
  this.filterRegistrationByEvent = (query) => {
    var inscriptions = this.inscriptions
    if (query !== undefined && query !== 'all') {
      // filter init
      inscriptions = inscriptions.filter((inscription) => {
        var validation = 0
        inscription.PRODUITS.forEach((produit) => {
          if (produit.race !== undefined && produit.race !== null) {
            if (String(produit.race._id) === String(query)) {
              validation++
            }
          }
        })

        if (validation > 0) {
          return true
        }
      })
    }
    return inscriptions
  }
  this.sortRegistration = (sort, query) => {
    var inscriptions = this.filterRegistrationByEvent(query)
    if (inscriptions.length >= 1) {
      // trie les dossier par ordre alphanétique
      if (sort === 'alpha') {
        inscriptions.sort((a, b) => {
          if (a.NOM !== undefined) {
            return a.NOM.localeCompare(b.NOM)
          }
        })
      } else if (sort === 'date') {
        inscriptions.sort((a, b) => {
          if (a.CREATED_AT !== undefined) {
            return new Date(b.CREATED_AT) - new Date(a.CREATED_AT)
          }
        })
      } else if (sort === 'certificats') {
        inscriptions.sort((a, b) => {
          if (a.CERTIF_MEDICAL === '' || a.CERTIF_MEDICAL === undefined) {
            a.test = 1
          } else {
            a.test = 0
          }
          if (b.CERTIF_MEDICAL === '' || b.CERTIF_MEDICAL === undefined) {
            b.test = 1
          } else {
            b.test = 0
          }
          return b.test - a.test
        })
      } else if (sort === 'paiements') {
        inscriptions.sort((a, b) => {
          if (a.PAYE.cb === true || a.PAYE.other_captured === true) {
            a.test = 1
          } else {
            a.test = 0
          }
          if (b.PAYE.cb === true || b.PAYE.other_captured === true) {
            b.test = 1
          } else {
            b.test = 0
          }
          return a.test - b.test
        })
      } else {
        inscriptions.sort((a, b) => {
          if (a.NOM !== undefined) {
            return a.NOM.localeCompare(b.NOM)
          }
        })
      }
      return inscriptions
    } else {
      return []
    }
  }

  this.formatedData = (sort, query) => {
    return {
      inscriptions: this.sortRegistration(sort, query),
      dons: this.tableauDons(),
      paiements: this.tableauPaiements(),
      dossiers_complets: this.dossiersValides()
    }
  }
}
