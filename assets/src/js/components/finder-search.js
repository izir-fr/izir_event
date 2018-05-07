var finder = () => {
  $('.eventName').each((key, val) => {
    if ($(val).text().toLowerCase() === 'test') {
      $($('.event')[key]).remove()
    }
  })
}

export default finder()
