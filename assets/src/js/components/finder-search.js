var finder = () => {
  $('.eventName').each((key, val) => {
    if ($(val).text().toLowerCase() === 'test') {
      $($('.event')[key]).remove()
    }
  })
  $(() => {
    var finderSumbitButton = $('#finder-submit-button')
    var finderButtonDesktop = $('#finder-button-desktop')
    var finderButtonMobile = $('#finder-button-mobile')

    var finderButton = () => {
      if ($(window).innerWidth() <= 850) {
        finderSumbitButton.remove()
        finderButtonMobile.append(finderSumbitButton)
      } else {
        finderSumbitButton.remove()
        finderButtonDesktop.append(finderSumbitButton)
      }
    }

    finderButton()

    $(window).on('resize', () => {
      finderButton()
    })
  })
}

export default finder()
