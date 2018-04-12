import init from './components/init.js'

init()

if (module.hot) {
  module.hot.accept(init, function () {
  })
}
