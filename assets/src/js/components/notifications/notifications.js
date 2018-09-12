var domain = document.location.origin

var notification = () => {
  $.ajax({
    type: 'GET',
    url: domain + '/notifications/receive/',
    // The key needs to match your method's input parameter (case-sensitive).
    // data: JSON.stringify({}),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (data) {
      if (!data.error_msg) {
        $('#user-notifications').text(data.length)
        if (data.length >= 1) {
          $('#user-notifications').addClass('badge-danger')
          $('#user-notifications').removeClass('badge-light')
        } else {
          $('#user-notifications').removeClass('badge-danger')
          $('#user-notifications').addClass('badge-light')
        }
      } else {
        console.log(data.error_msg)
      }
    },
    failure: function (errMsg) {
      console.log(errMsg)
    }
  })
}

export default notification()
