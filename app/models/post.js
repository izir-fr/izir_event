var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Event Schema
var postSchema = mongoose.Schema({
  titre: { type: String, required: true },
  short_text: { type: String },
  long_text: { type: String },
  youtube_id: { type: String },
  featured_image: { type: String },
  event_id: { type: Schema.ObjectId, ref: 'Event' },
  featured: { type: Boolean, default: false },
  blog_post: { type: Boolean, default: false },
  published_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
})

module.exports = mongoose.model('Post', postSchema)
