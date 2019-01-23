var Event = require('../../../app/models/event')
var Race = require('../../../app/models/race')
var Post = require('../../../app/models/post')
var dateNow = new Date(Date.now())
var Promise = require('bluebird')

// event finder
var eventFinderForm = (req, res, callback, error) => {
  var allEvents = []
  var discipline = req.query.discipline
  var date = {
    month: req.query.month,
    year: req.query.year,
    day: 1
  }

  // var activate = req.query.activate
  var queryDate, queryDiscipline, citySearch

  if (date.year === '') {
    date.year = dateNow.getFullYear()
  }

  if (date.month === '') {
    date.month = dateNow.getMonth()
    date.day = dateNow.getDate()
  } else {
    date.month = (date.month * 1) - 1
  }

  // date query
  queryDate = { date_debut: { $gte: new Date(date.year, date.month, date.day), $lt: new Date(date.year + 1, date.month, date.day) } }
  // city query
  if (req.query.city) {
    citySearch = req.query.city.toLowerCase()
  } else {
    citySearch = ''
  }

  // discipline query
  if (discipline !== '') {
    queryDiscipline = { $eq: discipline }
  } else {
    queryDiscipline = { $ne: '' }
  }

  var dbEvents = new Promise((resolve, reject) => {
    Race
      .find({
        $and: [
          queryDate,
          { discipline: queryDiscipline }
        ]
      })
      .exec((err, races) => {
        if (err) {
          reject(err)
        }

        var eventsId = []
        if (races.length >= 1) {
          races.forEach((race) => {
            eventsId.push(race.event)
          })
        }

        Event
          .find({ _id: eventsId })
          .populate('epreuves')
          .exec((err, events) => {
            if (err) {
              reject(err)
            }
            // city filter
            if (events !== undefined && events.length >= 1) {
              if (citySearch !== '' || citySearch !== null) {
                events.forEach((val) => {
                  // city query filter
                  if (val.adresse.ville) {
                    if (val.adresse.ville.toLowerCase().indexOf(citySearch) !== -1) {
                      allEvents.push(val)
                    }
                  }
                })
              } else {
                allEvents = events
              }
              allEvents.sort((a, b) => {
                return a.epreuves[0].date_debut - b.epreuves[0].date_debut
              })
            }
            resolve(allEvents)
          })
      })
  })

  var featuredPosts = new Promise((resolve, reject) => {
    Post
      .find({ 'published_date': { $lte: Date(Date.now()) }, 'featured': true })
      .sort({ 'published_date': -1 })
      .limit(2)
      .exec((err, posts) => {
        if (err) {
          reject(err)
        }
        resolve(posts)
      })
  })

  Promise
    .props({
      events: dbEvents,
      posts: featuredPosts
    })
    .then((val) => {
      var finderResult = {
        data: {
          event: val.events,
          posts: val.posts
        },
        queries: req.query
      }
      callback(finderResult)
    })
    .catch((err) => {
      error(err)
    })
}

module.exports = eventFinderForm
