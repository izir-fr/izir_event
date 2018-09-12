var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Notification Schema
var notificationSchema = mongoose.Schema({
  sender: { type: Schema.ObjectId, ref: 'User' },
  receiver: [{ type: Schema.ObjectId, ref: 'User', required: true }],
  message: { type: String, required: true },
  read_by: [{
    readerId: { type: Schema.ObjectId, ref: 'User', required: true },
    read_at: { type: Date }
  }],
  created_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Notification', notificationSchema)
