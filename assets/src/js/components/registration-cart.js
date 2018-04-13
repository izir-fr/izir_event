var registrationCart = () => {
  if ($('#registration-form').length !== 0) {
    $(() => {
      // var epreuveQt = 0
      // CART START
      var cart = () => {
        var totalData = []
        var tarif = 0
        // event subtotal
        $('.quantityInput').each((key, val) => {
          var subtotal = ($('input[name=tarif]')[key].value * 1) * ($('.quantity')[key].value * 1)
          $('.subtotalView')[key].textContent = subtotal
          $('input[name=subtotal]')[key].value = subtotal
        })

        // total
        $('input[name=subtotal]').each((key) => {
          totalData.push($('input[name=subtotal]')[key].value * 1)
        })
        totalData.forEach((val, key) => {
          tarif += totalData[key]
        })
        $('#totalview')[0].innerHTML = tarif
        $('input[name=total]').val(tarif)
      }

      var totalEpreuve = () => {
        var totalEpreuveQt = []
        $('.epreuveInput').each((key) => {
          totalEpreuveQt.push($('.epreuveInput')[key].value * 1)
        })
      }
      $(document).ready(() => {
        totalEpreuve()
        cart()
      })
      $('.input').on('change keyup click', (e) => {
        totalEpreuve()
        cart()
      })
    })
  }
}

export default registrationCart()
