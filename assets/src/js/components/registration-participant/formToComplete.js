var formToComplete = (field) => {
  $('.border-danger').each((key, val) => {
    $(val).removeClass('border-danger')
  })
  field.addClass('border border-danger').focus()
}

module.exports = formToComplete
