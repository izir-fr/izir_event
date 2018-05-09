var sendToFriend = () => {
  $(() => {
    $('#friends_add').on('click', () => {
      var emailForm =
      '<div class="form-group">' +
        '<label>Email *</label>' +
        '<input type="email" class="form-control" placeholder="Email" name="email"  value="">' +
      '</div>'

      $(emailForm).insertBefore($('#friends_add'))
    })
  })
}

export default sendToFriend()
