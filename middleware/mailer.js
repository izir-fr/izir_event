// config
var config = require('../config/mailer')

// modules
var nodemailer = require('nodemailer').createTransport(config)
var Promise = require('bluebird')

// models
var Mailer = require('../app/models/mailer')

module.exports = (datas) => {
  return new Promise((resolve, reject) => {
    var email = new Mailer(datas)
    // envoie du mail
    email.newEmail().then((data) => {
      nodemailer.sendMail(data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve('Email send')
        }
      })
    })
  })
}
