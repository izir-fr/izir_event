var nodemailer = require('nodemailer')

var User = require('./../../../app/models/user')
// Credentials
var credentials = require('./../../../app/config/credentials')
// Email config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits)

var emailNotification = (userId) => {
  User.findOne({_id: userId}, (err, user) => {
    if (err) throw err
    var mailOptions = {
      to: user.email,
      from: 'Notification Izir.fr <serviceclient@izir.fr>',
      subject: 'Une notification vous attend dans votre espace utilisateur',
      text: 'Bonjour,\n\n' +
      'vous venez de recevoir une notification dans votre espace utilisateur.\n\n' +
      'Pour la consulter rendez vous votre espace utilisateur.\n\n' +
      '- http://event.izir.fr/notifications/receive/' + user.id + ' \n\n' +
      'Bonne course !\n\n' +
      'Nicolas de izir.fr'
    }
    // envoie du mail
    smtpTransport.sendMail(mailOptions, (mailErr) => {
      if (mailErr) throw mailErr
    })
  })
}

module.exports = emailNotification
