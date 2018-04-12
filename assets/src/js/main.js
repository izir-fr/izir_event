import './components/init'
import './components/getSiteControl'
import './components/header-logo'
import './components/google-maps'
import './components/registration-cart'
import './components/registration-participant-validation'

if (module.hot && process.env.LOCAL === true) {
  module.hot.accept()
}
