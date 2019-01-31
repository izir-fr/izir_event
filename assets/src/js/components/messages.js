var messages = () => {
  if ($('#receivers').length >= 1) {
    var url = $(document)[0].URL
    // var event = $('input[name=event]')[0].value
    var receiverHtml = $('#receivers')[0].innerHTML

    var utf8 = (val) => {
      if (val) {
        try {
          return decodeURIComponent(val)
        } catch (err) {
          return ''
        }
      } else {
        return ''
      }
    }

    var resetInputRegistration = () => {
      if ($('input[name=registration]').length >= 1) {
        $('input[name=registration]').remove()
        $('#registration').addClass('d-none').removeClass('d-block')
      }
    }

    var receiverHelperTest = () => {
      if ($('.receiver').length >= 1) {
        $('#receiver_helper').remove()
      } else {
        $('#receivers').append(receiverHtml)
      }
    }

    var currentContactMessage = () => {
      $('.notification').each((key, notification) => {
        $(notification).addClass('d-block').removeClass('d-none')
        var display = 0
        var contacts = $(notification).find($('.id'))[0].innerText

        if ($('input[name=receiver]').length) {
          $('input[name=receiver]').each((key, receiver) => {
            contacts.split(',').forEach((contact) => {
              if (contact === receiver.value) {
                display++
              }
            })
          })

          if (display === 0) {
            $(notification).addClass('d-none').removeClass('d-block')
          }
        }
      })
    }

    var receiverContructor = (contact, id) => {
      return '<div class="d-inline-block m-2 receiver">' +
        '<span>' + contact + ',</span>' +
        '<input type="hidden" name="receiver" value="' + id + '">' +
      '</div>'
    }

    var cleanReceivers = () => {
      $('.receiver').remove()
    }

    $('input[name=select_all]').on('click', (e) => {
      if (e.target.checked === true) {
        $('.contact').each((key, contact) => {
          var html = receiverContructor(contact.innerText, $('.id')[key].innerText)
          $('#receivers').append(html)
          $(contact).addClass('btn-secondary').removeClass('btn-outline-primary')
        })
        $('')
      } else if (e.target.checked === false) {
        $('.contact').each((key, contact) => {
          $(contact).removeClass('btn-secondary').addClass('btn-outline-primary')
        })
        cleanReceivers()
      }
      receiverHelperTest()
      resetInputRegistration()
    })

    $('.contact').on('click', (e) => {
      var contact = e.currentTarget.outerText
      var id = $(e.currentTarget).find($('.id'))[0].innerText
      var receiverExist = 0

      $('input[name=receiver]').each((key, receiver) => {
        if (receiver.value === id) {
          receiverExist++
        }
      })

      if (receiverExist === 0) {
        var html = receiverContructor(contact, id)
        $('#receivers').append(html)
        $(e.currentTarget).addClass('btn-secondary').removeClass('btn-outline-primary')
      } else if (receiverExist >= 1) {
        $(e.currentTarget).removeClass('btn-secondary').addClass('btn-outline-primary')
        $('input[name=receiver]').each((key, receiver) => {
          if (receiver.value === id) {
            $('.receiver')[key].remove()
          }
        })
        $('.contact').each((key, contact) => {
          // console.log($('.id')[key].innerText, id)
          if ($('.id')[key].innerText === id) {
            $(contact).removeClass('btn-secondary').addClass('btn-outline-primary')
          }
        })
      }

      receiverHelperTest()
      resetInputRegistration()
      currentContactMessage()
    })

    var queryContact = (url) => {
      var querry = url.split('?')[1]
      var querries = []

      querry.split('&').forEach((val) => {
        if (val.split('=')[0] === 'contact') {
          querries.push({ contact: val.split('=')[1] })
        }
        if (val.split('=')[0] === 'registration') {
          querries.push({ registration: val.split('=')[1] })
        }
      })

      if (querries.length >= 1) {
        querries.forEach((querry) => {
          $('.contact').each((key, val) => {
            var contact = $(val).find($('.id'))[0].innerText
            if (contact === querry.contact) {
              $(val).addClass('btn-secondary').removeClass('btn-outline-primary')
              var html = receiverContructor(val.innerText, querry.contact)
              $('#receivers').append(html)
              $('#receiver_helper').remove()
            }
          })
          if (querry.registration !== undefined) {
            var input = '<input type="text" name="registration" class="form-control" value="' + querry.registration + '">'
            $('#registration').addClass('d-block').removeClass('d-none')
            $('#registration').append(input)
          }
        })
      }
      currentContactMessage()
    }

    $('#group_no_certificat').on('click', (e) => {
      cleanReceivers()
      $.get('messages/group/no-certificat', (data) => {
        data.forEach((contact) => {
          var handle = '@' + contact.participant.nom + '.' + contact.participant.prenom
          var html = receiverContructor(handle, contact.user)
          $('#receivers').append(html)
        })
        receiverHelperTest()
      })
    })

    $('#group_no_paiement').on('click', (e) => {
      cleanReceivers()
      $.get('messages/group/no-paiement', (data) => {
        data.forEach((contact) => {
          var handle = '@' + utf8(contact.participant.nom) + '.' + utf8(contact.participant.prenom)
          var html = receiverContructor(handle, contact.user)
          $('#receivers').append(html)
        })
        receiverHelperTest()
      })
    })

    queryContact(url)
  }
}

export default messages()
