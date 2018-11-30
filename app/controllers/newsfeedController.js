// Modèles
var Post = require('../models/post')

var newsfeedController = {
  getAllPosts: (req, res) => {
    Post
      .find({ 'published_date': { $lte: Date(Date.now()) }, 'archived': { $ne: true } })
      .sort({ 'published_date': -1 })
      .exec((err, posts) => {
        if (err) {
          res.redirect('/event/finder')
        }
        res.render('partials/newsfeed/index', { posts: posts })
      })
  },
  getSinglePost: (req, res) => {
    Post
      .findOne({ _id: req.params.id })
      .exec((err, post) => {
        if (err) {
          res.redirect('/event/finder')
        }
        res.render('partials/newsfeed/single', { post: post })
      })
  }
}

module.exports = newsfeedController
