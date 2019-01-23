var Event = require('../../../app/models/event')
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
    Event
      .find({
        $and: [
          { epreuves: { $elemMatch: queryDate } },
          { 'epreuves.discipline': queryDiscipline }
        ]
      })
      .populate('epreuves')
      .sort({ 'epreuves.0.date_debut': 1 })
      .exec((err, results) => {
        if (err) {
          reject(err)
        }

        // city filter
        if (results !== undefined) {
          if (citySearch !== '' || citySearch !== null) {
            results.forEach((val) => {
              // city query filter
              if (val.adresse.ville) {
                if (val.adresse.ville.toLowerCase().indexOf(citySearch) !== -1) {
                  allEvents.push(val)
                }
              }
            })
          } else {
            allEvents = results
          }
          resolve(allEvents)
        }
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
