var register = () => {
  $(document).ready(() => {
    $('input[name=username]').keydown((e) => {
      if (e.keyCode === 32) {
        e.preventDefault()
      }
    })
  })
}

export default register()
