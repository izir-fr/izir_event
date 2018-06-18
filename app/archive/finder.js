// var apis = [
//   {url: 'https://jn-prod.github.io/node_scrapper/exports_files/details/tri_details.json',
//     discipline: 'Triathlon'},
//   {url: 'https://jn-prod.github.io/node_scrapper/exports_files/details/vtt_details.json',
//     discipline: 'VTT'},
//   {url: 'https://jn-prod.github.io/node_scrapper/exports_files/details/athle_details.json',
//     discipline: 'Running'}
// ]

// api call
// var loadJsonSync = (element) => {
//   return new Promise((resolve, reject) => {
//     try {
//       request(element.url, (err, res, data) => {
//         if (err) {
//           reject(err)
//         }
//         var parsedData = JSON.parse(data)
//         var results = {
//           event: parsedData,
//           discipline: element.discipline
//         }
//         resolve(results)
//       })
//     } catch (err) { reject(err) }
//   })
// }

// event finder
var eventFinderForm = (req, res) => {
  var allEvents = []
  var allItems = []
  // var api1 = loadJsonSync(apis[0])
  // var api2 = loadJsonSync(apis[1])
  // var api3 = loadJsonSync(apis[2])
  var citySearch
  var month = req.query.month
  var discipline = req.query.discipline
  var activate = req.query.activate

  if (req.query.city) {
    citySearch = req.query.city.toLowerCase()
  } else {
    citySearch = ''
  }

  // Promise
  //   .all([api1, api2, api3])
  //   .then((res) => {
  //     if (activate !== 'on') {
  //       res.forEach((val) => {
  //         var items = val.event
  //         var discipline = val.discipline
  //         items.forEach((val) => {
  //           if (val.eventName !== '' || val.name !== undefined) {
  //             var tarif
  //             if (val.prixPublic === '' || val.prixPublic === null) {
  //               tarif = 'NC'
  //             } else {
  //               tarif = val.prixPublic
  //             }

  //             //  create object
  //             var item = {
  //               name: val.eventName,
  //               description: val.description,
  //               epreuves: [
  //                 {
  //                   tarif: tarif,
  //                   discipline: discipline,
  //                   name: val.eventName,
  //                   date_debut: new Date(Date.UTC(val.date.split('/')[2], val.date.split('/')[1] - 1, val.date.split('/')[0])),
  //                   source: 'externe'
  //                 }
  //               ],
  //               adresse: { ville: val.lieu },
  //               source: 'externe'
  //             }

  //             // date query filter
  //             if (month === '') {
  //               if (item.epreuves[0].date_debut > dateNow) {
  //                 allItems.push(item)
  //               }
  //             } else {
  //               if (item.epreuves[0].date_debut.getMonth() === (month - 1)) {
  //                 allItems.push(item)
  //               }
  //             }
  //           }
  //         })
  //       })
  //     }

  //     // discipline query filter
  //     if (discipline !== '') {
  //       allItems.filter(element => element.epreuves[0].discipline.toLowerCase() === discipline.toLowerCase())
  //     }

  //     // city query filter
  //     if (citySearch !== '') {
  //       allItems.filter(element => element.adresse.ville.toLowerCase() === citySearch.toLowerCase())
  //     }
  //     return allItems
  //   })
    // .then((json) => {
      var queryDate, queryDiscipline
      // date query
      if (month !== '') {
        queryDate = { date_debut: { $gte: new Date(dateNow.getFullYear(), (month - 1), 1), $lt: new Date(dateNow.getFullYear(), month, 1) } }
      } else {
        queryDate = { date_debut: { $gte: dateNow } }
      }

      // discipline query
      if (discipline !== '') {
        queryDiscipline = { $eq: discipline }
      } else {
        queryDiscipline = { $ne: '' }
      }

      Event
        .find({
          $and: [
            { epreuves: { $elemMatch: queryDate } },
            { 'epreuves.discipline': queryDiscipline }
          ]
        })
        .exec((err, results) => {
          if (err) {
            req.flash('error_msg', 'Une erreur est survenue')
            res.redirect('/')
          }
          if (results !== undefined) {
            results.forEach((val) => {
              // city query filter
              if (val.adresse.ville.toLowerCase().indexOf(citySearch) !== -1) {
                allEvents.push(val)
              }
            })
          }

          // json.forEach((val) => {
          //   var event = val.name
          //   var doublon = (val) => {
          //     if (val.doublon !== undefined) {
          //       var test = val.doublon
          //       return test.toLowerCase() === event.toLowerCase()
          //     }
          //   }
          //   var search = allEvents.find(doublon)

          //   if (search === undefined) {
          //     allEvents.push(val)
          //   }
          // })

          allEvents.sort((a, b) => {
            return a.epreuves[0].date_debut - b.epreuves[0].date_debut
          })

          var finderResult = {
            data: {
              event: allEvents
            },
            date_list: dateList,
            discipline_list: disList,
            queries: req.query
          }
          res.render('partials/event/finder', finderResult)
        })
    // })