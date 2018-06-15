var async = require('async')
var bcrypt = require('bcryptjs')
var crypto = require('crypto')
var SibApiV3Sdk = require('sib-api-v3-sdk')
var nodemailer = require('nodemailer')

// Credentials
var credentials = require('../config/credentials')

// Models
var User = require('../models/user')

// custom modules
var catList = require('../../custom_modules/lists/category-list')
var dateList = require('../../custom_modules/lists/date-list')

// Email nodemailer config
var smtpTransport = nodemailer.createTransport(credentials.smtpCredits)

// Sendinblue
var defaultClient = SibApiV3Sdk.ApiClient.instance
var apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = credentials.sendinblueCredits

// Controllers
var userCtrl = {
  // Get register form
  getRegister: (req, res) => {
    res.render('partials/user/register')
  },
  // Post a register
  postRegister: (req, res) => {
    var errors

    try {
      var name = req.body.name.toLowerCase()
      var surname = req.body.surname.toLowerCase()
      var username = req.body.username.toLowerCase()
      var email = req.body.email.toLowerCase()
      var password = req.body.password
    } catch (err) {
      res.render('partials/user/register', {error: err})
    }

    var tests = [
      {
        search: {username: username},
        msg: 'Ce non d\'utilisateur est déjà utilisé. Si vous avez oublié votre mot de passe, merci de cliquez sur mot de passe oublié.'
      },
      {
        search: {email: email},
        msg: 'C\'est email est déjà utilisé. Si vous avez oublié votre mot de passe, merci de cliquez sur mot de passe oublié.'
      }
    ]

    var validationUser = (search, message, success) => {
      User.findOne(search, (err, res) => {
        if (err) {
          throw err
        } else {
          if (res !== null) {
            // console.log(res)
            errors = message
          }
          success(errors)
        }
      })
    }

    var createAction = (errors) => {
      if (errors) {
        // console.log(errors)
        res.render('partials/user/register', {error: errors})
      } else {
        var newUser = new User({
          name: name,
          surname: surname,
          email: email,
          username: username,
          password: password
        })

        // console.log(newUser)
        User.createUser(newUser, function (err, user) {
          if (err) throw err
          // Create sendinblue contact
          var apiInstance = new SibApiV3Sdk.ContactsApi()
          var createContact = new SibApiV3Sdk.CreateContact() // CreateContact | Values to create a contact

          createContact = {
            email: newUser.email,
            attributes: {
              'PRENOM': newUser.name,
              'NOM': newUser.surname
            },
            listIds: [21, 18],
            updateEnabled: true
          }

          apiInstance.createContact(createContact).then((data) => {
            console.log('API called successfully. Returned data: ' + data)
          }, function (error) {
            console.error(error)
          })
        })

        req.flash('success_msg', 'Vous êtes enregistré et pouvez vous connecter')
        res.redirect('/user/login')
      }
    }

    // Validation
    req.checkBody('name', 'Prénom requis').notEmpty()
    req.checkBody('surname', 'Nom requis').notEmpty()
    req.checkBody('email', 'Email requis').notEmpty()
    req.checkBody('email', 'Email invalid').isEmail()
    req.checkBody('username', 'Nom d\'utilisateur requis').notEmpty()
    req.checkBody('password', 'Mot de passe requis').notEmpty()
    req.checkBody('password2', 'Les mots de passe ne sont pas identiques').equals(req.body.password)

    errors = req.validationErrors()

    // console.log(test)
    validationUser(tests[0].search, tests[0].msg, (res) => {
      validationUser(tests[1].search, tests[1].msg, (res) => {
        createAction(res)
      })
    })
  },
  // Get login form
  getLogin: function (req, res) {
    if (req.user) {
      res.redirect('profil/' + req.user.id + '/')
    } else {
      res.render('partials/user/login')
    }
  },
  // Post a login
  postLogin: function (req, res) {
    res.redirect('/')
  },
  // Get profil page redirect to a user profil
  getProfil: function (req, res) {
    var user = req.user
    res.redirect('/user/profil/' + user.id + '/')
  },
  // Get a user profil
  getProfilById: function (req, res) {
    res.render('partials/user/profil')
  },
  // Get edit page a user profil edit page based on :id
  getProfilEditById: function (req, res) {
    var jourNaissance,
      moisNaissance,
      anneeNaissance,
      data

    if (req.user.id === req.params.id) {
      User.findById(req.user.id, function (err, user) {
        if (err) throw err

        if (user.birthday) {
          jourNaissance = user.birthday.split('/')[0]
          moisNaissance = user.birthday.split('/')[1]
          anneeNaissance = user.birthday.split('/')[2]
        } else {
          jourNaissance = ''
          moisNaissance = ''
          anneeNaissance = ''
        }

        data = {
          jourNaissance: jourNaissance,
          moisNaissance: moisNaissance,
          anneeNaissance: anneeNaissance
        }
        // console.log(user)

        // console.log(data)
        res.render('partials/user/edit-profil', { data: data, date_list: dateList, category_list: catList })
      })
    } else {
      res.redirect('/user/profil/' + req.user.id + '/')
    }
  },
  // Post edit a user  profil modification based on :id
  postProfilEditById: function (req, res) {
    try {
      var updateUser = {
        name: req.body.name.toLowerCase(), // prénom
        surname: req.body.surname.toLowerCase(), // Nom
        username: req.body.username.toLowerCase(), // Pseudo
        birthday: req.body.jourNaissance + '/' + req.body.moisNaissance + '/' + req.body.anneeNaissance, // Date de naissance
        sex: req.body.sex, // Je suis
        numLicence: req.body.numLicence,
        categorie: req.body.categorie,
        team: req.body.team,
        adresse1: req.body.adresse1.toLowerCase(), // Adresse 1
        adresse2: req.body.adresse2.toLowerCase(), // Adresse 2
        codePostal: req.body.codePostal, // Code Postal
        city: req.body.city.toLowerCase(), // Ville
        email: req.body.email.toLowerCase(), // Email
        foneFix: req.body.foneFix, // Téléphone Fix
        fonePort: req.body.fonePort, // Téléphone port
        updated: new Date()
      }
    } catch (err) {
      req.flash('error_msg', err)
      res.redirect('/user/edit-profil/' + req.user.id)
    }

    User.findByIdAndUpdate(req.user.id, updateUser, function (err, user) {
      if (err) {
        req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour de votre profil')
        res.redirect('/user/edit-profil/' + req.user.id)
      } else {
        req.flash('success_msg', 'Votre profil a été mis à jour')
        res.redirect('/user/profil/' + req.user.id + '/')
      }
    })
  },
  // Get password forgot page
  getPasswordForgot: function (req, res) {
    res.render('partials/user/password-forgot')
  },
  // Post a password forgot
  postPasswordForgot: function (req, res, next) {
    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (err) throw err
          if (!user) {
            req.flash('error_msg', 'Aucun compte n\'existe avec cette adresse e-mail')
            return res.redirect('/user/password-forgot')
          }

          user.resetPasswordToken = token
          user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

          user.save(function (err) {
            done(err, token, user)
          })
        })
      },
      function (token, user, done) {
        var mailOptions = {
          to: user.email,
          from: 'Event Izir <event@izir.fr>',
          subject: 'Réinitialisation du mot de passe',
          text: 'Vous recevez cet email car vous (ou quelqu\'un d\'autre) à demander de réinitialiser le mode de passe de votre compte.\n\n' +
            'Merci de cliquer sur le lien suivant ou de le copier-coller dans votre navigateure pour continuer le processus:\n\n' +
            'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
            'Si vous n\'êtes pas à l\'origine de cette demande merci d\'ignorer cet email, ainsi votre mot de passe restera inchangé.\n'
        }
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) throw err
          req.flash('info_msg', 'Un email a été envoyé à ' + user.email + ' avec toutes les instructions.')
          done(err, 'done')
        })
      }
    ], function (err) {
      if (err) return next(err)
      res.redirect('/')
    })
  },
  // Get a user password token based on :token
  getResetByToken: function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
      if (err) throw err
      if (!user) {
        req.flash('error_msg', 'Votre demande changement de mot de passe n\'est pas valide ou à expiré.')
        return res.redirect('/user/password-forgot')
      } else {
        var data = {user: user, resetPasswordToken: user.resetPasswordToken}
        res.render('partials/user/reset-password', data)
      }
    })
  },
  // Post a user password token based on :token
  postResetByToken: function (req, res) {
    async.waterfall([
      function (done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
          if (err) throw err
          if (!user) {
            req.flash('error_msg', 'Votre demande changement de mot de passe n\'est pas valide ou à expiré.')
            return res.redirect('back')
          }

          // Validation
          var password = req.body.password
          req.checkBody('password', 'Mot de passe requis').notEmpty()
          req.checkBody('password2', 'Les mots de passe ne sont pas identiques').equals(req.body.password)

          // Generate a salt
          var salt = bcrypt.genSaltSync(10)
          // Hash the password with the salt
          var hash = bcrypt.hashSync(password, salt)

          var errors = req.validationErrors()

          if (errors) {
            res.render('partials/reset-password', {
              error: errors
            })
          } else {
            user.password = hash
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined

            user.save(function (err) {
              if (err) throw err
              req.logIn(user, function (err) {
                done(err, user)
              })
            })
          }
        })
      },
      function (user, done) {
        var mailOptions = {
          to: user.email,
          from: 'Event Izir <event@izir.fr>',
          subject: 'Votre mot de passe a été changé',
          text: 'Bonjour,\n\n' +
            'Ceci est une confirmation que le mot de passe pour le compte ' + user.email + ' a bien été changé.\n'
        }
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) throw err
          req.flash('success_msg', 'Bravo! Votre mot de passe a été changé.')
          done(err)
        })
      }
    ], function (err) {
      if (err) throw err
      res.redirect('/')
    })
  },
  // Get user certificat based on :id
  getCertificatByUserId: function (req, res) {
    var event = {}
    console.log(req.query.event)
    if (req.query.event) {
      event.id = req.query.event
    }
    res.render('partials/user/certificat', event)
  },
  // Post user certificat based on :id
  postCertificatByUserId: function (req, res) {
    var certificat = req.body.certificat_file

    if (certificat === '' || certificat === undefined) {
      req.flash('error_msg', 'Aucun certificat n\'a été joint')
      res.redirect('/user/certificat/' + req.user.id)
    } else {
      try {
        var updateUser = {
          certificat: {
            expiration_month: req.body.month,
            expiration_year: req.body.year,
            file: certificat,
            updated: new Date()
          },
          updated: new Date()
        }
      } catch (err) {
        req.flash('error_msg', err)
        res.redirect('/user/certificat/' + req.user.id)
      }

      User.findByIdAndUpdate(req.user.id, updateUser, function (err, user) {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour de votre certificat')
          res.redirect('/user/certificat/' + req.user.id)
        } else {
          req.flash('success_msg', 'Votre certificat a été mis à jour')
          if (req.query.event) {
            res.redirect('/inscription/pre-inscription/' + req.query.event)
          } else {
            res.redirect('/user/profil/' + req.user.id + '/')
          }
        }
      })
    }
  },
  // Get user invitation page
  getAmiEmailForm: function (req, res) {
    res.render('partials/user/amis')
  },
  // Post user invitation based on :id
  postAmiEmail: function (req, res) {
    var invitations = []
    var emails = req.body.email

    if (emails.constructor === Array) {
      emails.forEach((val) => {
        if (val !== '') {
          invitations.push(val)
        }
      })
    } else {
      invitations.push(emails)
    }

    invitations.forEach((val) => {
      var mailOptions = {
        to: val,
        from: req.user.name + ' ' + req.user.surname + ' <' + req.user.email + '>',
        subject: 'Connais-tu Event Izir',
        text: req.body.description + '\n\n'
      }
      smtpTransport.sendMail(mailOptions, (err) => {
        if (err) throw err
      })
    })

    req.flash('success_msg', 'Vos amis ont été invités')
    res.redirect('/user/profil/' + req.user.id + '/')
  },
  // Get user logout
  getLogout: function (req, res) {
    req.logout()
    req.flash('success_msg', 'Vous êtes déconnecté')
    res.redirect('/')
  }
}

module.exports = userCtrl
