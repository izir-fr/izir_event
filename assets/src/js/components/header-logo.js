// menu
var headerLogo = () => {
  $(() => {
    var logo = $('#logo')
    var userLink = $('#user-link')
    var searchBlock = $('#menu-search-block')
    var windowTest = () => {
      if ($(window).innerWidth() <= 767) {
        logo.remove()
        userLink.remove()
        searchBlock.remove()
        $('#smallscreen-logo').append(logo)
        $('#smallscreen-user').append(userLink)
        $('#smallscreen-search').append(searchBlock)
      } else {
        logo.remove()
        userLink.remove()
        searchBlock.remove()
        $('#fullscreen-logo').append(logo)
        $('#fullscreen-user').append(userLink)
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
      $('#profil-menu').toggleClass('d-sm-up')
    })
  })
}

export default headerLogo()
