var express = require('express')
var router = express.Router()
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Models
var User = require('../models/user')

// Controllers
var userCtrl = require('../controllers/userController')

// Custom Modules
var ensureAuthenticated = require('../../custom_modules/app/router/ensureAuthenticated')

// Passport config
passport.use(
  new LocalStrategy(
    function (username, password, done) {
      User.getUserByUsername(username.toLowerCase(), function (err, user) {
        if (err) throw err
        if (!user) {
          return done(null, false, {message: 'Utilisateur inconnu'})
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
          if (err) throw err
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, {message: 'Mot de passe incorrect'})
          }
        })
      })
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user)
  })
})

/* ==========
START APP =>
========== */

// Get register form
router.get('/register', userCtrl.getRegister)

// Post a register
router.post('/register', userCtrl.postRegister)

// Get login form
router.get('/login', userCtrl.getLogin)

// Post a login
router.post(
  '/login'
  , passport.authenticate('local', {failureRedirect: '/user/login', failureFlash: true})
  , userCtrl.postLogin
)
// Get profil page redirect to a user profil
router.get('/profil', ensureAuthenticated, userCtrl.getProfil)

// Get a user profil
router.get('/profil/:id', ensureAuthenticated, urlencodedParser, userCtrl.getProfilById)

// Get edit page a user profil edit page based on :id
router.get('/profil/edit/:id', ensureAuthenticated, userCtrl.getProfilEditById)

// Post edit a user  profil modification based on :id
router.post('/profil/edit/:id', userCtrl.postProfilEditById)

// Get password forgot page
router.get('/password-forgot', userCtrl.getPasswordForgot)

// Post a password forgot
router.post('/password-forgot', userCtrl.postPasswordForgot)

// Get a user password token based on :token
router.get('/reset/:token', userCtrl.getResetByToken)

// Post a user password token based on :token
router.post('/reset/:token', userCtrl.postResetByToken)

// Get user certificat based on :id
router.get('/certificat/:id', ensureAuthenticated, userCtrl.getCertificatByUserId)

// Post user certificat based on :id
router.post('/certificat/:id', userCtrl.postCertificatByUserId)

// Get user invitation page
router.get('/amis', ensureAuthenticated, userCtrl.getAmiEmailForm)

// Post user invitation based on :id
router.post('/amis/:id', userCtrl.postAmiEmail)

// Get user logout
router.get('/logout', userCtrl.getLogout)

module.exports = router
