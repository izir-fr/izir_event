// menu
var headerLogo = () => {
  $(() => {
    var logo = $('#logo')
    var userLink = $('#user-menu')
    var searchBlock = $('#menu-search-block')
    var windowTest = () => {
      if ($(window).innerWidth() <= 767) {
        logo.remove()
        userLink.remove()
        searchBlock.remove()
        $('#smallscreen-logo').append(logo)
        $('#mobile-user-menu').append(userLink)
        $('#smallscreen-search').append(searchBlock)
        $('#mobile-user-menu').addClass('d-none')
        $('#user-menu').removeClass('d-flex')
        $('#user-menu').addClass('d-block')
      } else {
        logo.remove()
        userLink.remove()
        searchBlock.remove()
        $('#fullscreen-logo').append(logo)
        $('#desktop-user-menu').append(userLink)
        $('#fullscreen-search').append(searchBlock)
        $('#user-menu').addClass('d-flex')
        $('#user-menu').removeClass('d-block')
      }
    }
    if (windowTest === true) {
      logo.remove()
      $('#smallscreen-logo').append(logo)
      // $('#user-menu').toggleClass('d-none')
    }

    windowTest()

    $(window).on('resize', () => {
      windowTest()
    })
    $('#mobile-menu').on('click', (e) => {
      $('#mobile-user-menu').toggleClass('d-none')
    })
  })
}

export default headerLogo()
