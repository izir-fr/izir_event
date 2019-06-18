var User = require('./user')
var Promise = require('bluebird')

module.exports = function Mailer (datas) {
  // @datas.sender
  this.from = 'Notification Izir.fr <serviceclient@izir.fr>'

  // @datas.user with user _id
  this.user = () => {
    if (datas.user) {
      return new Promise((resolve, reject) => {
        User.findById(datas.user).exec((err, user) => {
          if (err) {
            reject(err)
          } else {
            resolve(user)
          }
        })
      })
    }
  }

  // @datas.to generate from this.user if datas.to not definied
  this.to = () => {
    return new Promise((resolve, reject) => {
      if (datas.user) {
        this.user()
          .then((data) => {
            resolve(data)
          })
          .catch((err) => { reject(err) })
      } else if (datas.to !== undefined && datas.to !== null && datas.to !== '') {
        var email = datas.to
        resolve({ email: email })
      } else {
        resolve(null)
      }
    })
  }

  // @datas.subject
  this.subject = () => {
    if (datas.subject !== undefined && datas.subject !== null && datas.subject !== '') {
      return datas.subject
    } else {
      return 'Une notification vous attend dans votre espace utilisateur'
    }
  }

  // @datas.text
  this.text = (receiver) => {
    if (datas.text !== undefined && datas.text !== null && datas.text !== '') {
      return datas.text
    } else {
      var link = ''
      if (receiver) {
        if (receiver._id) {
          link = '- http://event.izir.fr/notifications/receive/' + receiver._id + ' \n\n'
        }
      }
      return 'Bonjour,\n\n' +
      'Vous venez de recevoir une notification dans votre espace utilisateur.\n\n' +
      link +
      'Pour la consulter rendez vous sur votre espace utilisateur.\n\n' +
      'Bonne course !\n\n' +
      'Nicolas de izir.fr'
    }
  }

  this.newEmail = () => {
    return new Promise((resolve, reject) => {
      this.to()
        .then((receiver) => {
          var email = {
            from: this.from,
            to: receiver.email,
            subject: this.subject(),
            text: this.text(receiver)
          }
          resolve(email)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
