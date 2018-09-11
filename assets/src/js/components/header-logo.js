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
        $('#user-menu').addClass('d-sm-up')
      } else {
        logo.remove()
        userLink.remove()
        searchBlock.remove()
        $('#fullscreen-logo').append(logo)
        $('#desktop-user-menu').append(userLink)
        $('#fullscreen-search').append(searchBlock)
      }
    }
    if (windowTest === true) {
      logo.remove()
      $('#smallscreen-logo').append(logo)
    }

    windowTest()

    $(window).on('resize', () => {
      windowTest()
    })
    $('#mobile-menu-trigger').on('click', () => {
      $('#user-menu').toggleClass('d-sm-up')
    })
  })
}

export default headerLogo()
