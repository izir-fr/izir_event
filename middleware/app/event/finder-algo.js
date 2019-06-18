var Event = require('../../../app/models/event')
var Race = require('../../../app/models/race')
var Post = require('../../../app/models/post')
var dateNow = new Date(Date.now())
var Promise = require('bluebird')

var featuredPosts = new Promise((resolve, reject) => {
  Post
    .find({ 'published_date': { $lte: Date(Date.now()) }, 'featured': true })
    .sort({ 'published_date': -1 })
    .limit(1)
    .exec((err, posts) => {
      if (err) {
        reject(err)
      }
      resolve(posts)
    })
})

var dbRaces = (query) => {
  return new Promise((resolve, reject) => {
    Race
      .find(query)
      .exec((err, races) => {
        if (err) {
          reject(err)
        }
        resolve(races)
      })
  })
}

var dbEvents = (query) => {
  return new Promise((resolve, reject) => {
    Event
      .find(query)
      .populate('epreuves')
      .exec((err, events) => {
        if (err) {
          reject(err)
        }
        resolve(events)
      })
  })
}

var query = (req) => {
  var queryDate, queryDiscipline, citySearch

  var discipline = req.query.discipline

  var date = {
    month: req.query.month,
    year: req.query.year,
    day: 1
  }

  // var activate = req.query.activate

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

  return {
    date: queryDate,
    discipline: queryDiscipline,
    city: citySearch
  }
}

var events = (req) => {
  return new Promise((resolve, reject) => {
    var allEvents = []

    dbRaces({ $and: [ query(req).date, { discipline: query(req).discipline } ] })
      .then((races) => {
        var eventsId = []
        if (races.length >= 1) {
          races.forEach((race) => {
            eventsId.push(race.event)
          })
        }

        return eventsId
      })
      .then((eventsId) => {
        dbEvents({_id: eventsId})
          .then((events) => {
            var cleandedEvents = []
            // city filter
            if (events !== undefined && events.length >= 1) {
              events.forEach((event) => {
                if (event.epreuves.length >= 1) {
                  cleandedEvents.push(event)
                }
              })

              if (query(req).city !== '' || query(req).city !== null) {
                cleandedEvents.forEach((val) => {
                  // city query filter
                  if (val.adresse.ville) {
                    if (val.adresse.ville.toLowerCase().indexOf(query(req).city) !== -1) {
                      allEvents.push(val)
                    }
                  }
                })
              } else {
                allEvents = cleandedEvents
              }
              allEvents.sort((a, b) => {
                if (a.epreuves[0] !== undefined && b.epreuves[0] !== undefined) {
                  return a.epreuves[0].date_debut - b.epreuves[0].date_debut
                }
              })
            }
            return allEvents
          })
          .then((allEvents) => {
            var cleanedEvents = []
            if (allEvents.length >= 1) {
              allEvents.forEach((event) => {
                if (event.name.toLowerCase() !== 'test') {
                  cleanedEvents.push(event)
                }
              })
            }
            resolve(cleanedEvents)
          })
          .catch((err) => {
            if (err) {
              reject(err)
            }
          })
      })
      .catch((err) => {
        if (err) {
          reject(err)
        }
      })
  })
}

// event finder
var eventFinderForm = (req, res, callback, error) => {
  Promise
    .props({
      events: events(req),
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
