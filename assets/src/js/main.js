import init from './components/init'
import gsc from './components/getSiteControl'
import headerLogo from './components/header-logo'
import googleMap from './components/google-maps'

init()
gsc()
headerLogo()
googleMap()

if (module.hot) {
  module.hot.accept(init, function () {
  })
  module.hot.accept(gsc, function () {
  })
  module.hot.accept(headerLogo, function () {
  })
  module.hot.accept(googleMap, function () {
  })
}
