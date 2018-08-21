var url = document.location.pathname

var ajaxPostForm = (data) => {
  $.ajax({
    type: 'POST',
    url: url + '/post',
    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (data) {
      if (!data.error_msg) {
        window.location = data.redirect
      } else {
        console.log(data.error_msg)
      }
    },
    failure: function (errMsg) {
      console.log(errMsg)
    }
  })
}

module.exports = ajaxPostForm
