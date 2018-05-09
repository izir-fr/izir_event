var selectQuery = () => {
  $(() => {
    var url = window.location.search.split('?')
    if (url.length !== 0) {
      console.log(url)
      var allQueries = url[1].split('&')
      var formatedQuery = []

      allQueries.forEach((val) => {
        formatedQuery.push({
          query: decodeURIComponent(val.split('=')[0]),
          name: decodeURIComponent(val.split('=')[1])
        })
      })

      console.log(allQueries)

      $('select').each((key, input) => {
        formatedQuery.forEach((val) => {
          if (val.query === input.name) {
            var options = $(input).children()
            options.each((key, option) => {
              var query = (val.name.split('+'))
              var queryFormated = query.join(' ')
              console.log(queryFormated)
              if (option.value.toLowerCase() === queryFormated.toLowerCase()) {
                option.selected = true
              }
            })
          }
        })
      })
    }
  })
}

export default selectQuery()
