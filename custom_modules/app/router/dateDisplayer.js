var dateDisplayer = (date) => {
  return {
    jour: date.getDate(),
    mois: (date.getMonth() + 1),
    annee: date.getFullYear(),
    heure: date.getHours(),
    minute: date.getMinutes()
  }
}

module.exports = dateDisplayer
