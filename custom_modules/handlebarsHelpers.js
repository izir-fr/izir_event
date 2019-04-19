module.exports = {
  date: (val) => {
    if (val !== undefined) {
      return val.getDate() + '/' + (parseInt(val.getMonth()) + 1) + '/' + val.getFullYear()
    } else {
      return ''
    }
  },
  dateFullYear: (val) => {
    if (val !== undefined) {
      return val.getUTCFullYear()
    } else {
      return ''
    }
  },
  dateMonth: (val) => {
    if (val !== undefined) {
      return (val.getUTCMonth() + 1)
    } else {
      return ''
    }
  },
  dateDay: (val) => {
    if (val !== undefined) {
      return val.getUTCDate()
    } else {
      return ''
    }
  },
  dateHours: (val) => {
    if (val !== undefined) {
      return val.getUTCHours()
    } else {
      return ''
    }
  },
  dateMinutes: (val) => {
    if (val !== undefined) {
      return val.getUTCMinutes()
    } else {
      return ''
    }
  },
  dateMonthText: (val) => {
    if (val !== undefined) {
      var month = parseInt(val.getMonth()) + 1
    }

    if (month === 1) {
      return 'Janvier'
    } else if (month === 2) {
      return 'Février'
    } else if (month === 3) {
      return 'Mars'
    } else if (month === 4) {
      return 'Avril'
    } else if (month === 5) {
      return 'Mai'
    } else if (month === 6) {
      return 'Juin'
    } else if (month === 7) {
      return 'Juillet'
    } else if (month === 8) {
      return 'Août'
    } else if (month === 9) {
      return 'Septembre'
    } else if (month === 10) {
      return 'Octobre'
    } else if (month === 11) {
      return 'Novembre'
    } else if (month === 12) {
      return 'Décembre'
    }
  },
  userDateDay: (val) => { return val.split('/')[0] },
  userDateMonth: (val) => { return val.split('/')[1] },
  userDateYear: (val) => { return val.split('/')[2] },
  utf8: (val) => {
    return require('./format/utf8')(val)
  }
}
