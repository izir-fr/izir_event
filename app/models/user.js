var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var Promise = require('bluebird')

// Helpers
var userErrorsHelpers = require('../helpers/user_error_helpers')
var userSuccessHelpers = require('../helpers/user_success_helpers')

// User Schema
var UserSchema = mongoose.Schema({
  username: { type: String, index: true },
  password: { type: String },
  email: { type: String },
  name: { type: String },
  surname: { type: String },
  birthday: { type: String },
  sex: { type: String },
  team: { type: String },
  numLicense: { type: String },
  categorie: { type: String },
  adresse1: { type: String },
  adresse2: { type: String },
  codePostal: { type: String },
  city: { type: String },
  foneFix: { type: String },
  fonePort: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },
  certificat: {
    expiration_month: { type: String },
    expiration_year: { type: String },
    file: { type: String },
    updated: { type: Date }
  },
  // Comptabilité
  titulaire: { type: String },
  code_etablissement: { type: String },
  code_guichet: { type: String },
  numero_de_compte: { type: String },
  cle_RIB: { type: String },

  // log
  created_at: { type: Date, required: true, default: Date.now },
  updated: { type: Date }// updated: { type: String }
})

var User = module.exports = mongoose.model('User', UserSchema)

module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) throw err
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      if (err) throw err
      newUser.password = hash
      newUser.save(callback)
    })
  })
}

module.exports.getUserByUsername = function (username, callback) {
  User.findOne({username: username}, callback)
}

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback)
}

module.exports.userExist = function (user, callback) {
  User.findOne({ $or: [ { email: user.email }, { username: user.username } ] }, callback)
}

module.exports.userCreateAction = (user) => {
  return new Promise((resolve, reject) => {
    User.userExist(user, (err, data) => {
      if (err) {
        reject(userErrorsHelpers.globalMsg)
      } else {
        if (data === null || data.length > 0) {
          User.createUser(user, function (err, user) {
            if (err) {
              reject(userErrorsHelpers.globalMsg)
            } else {
              resolve(userSuccessHelpers.globalMsg)
            }
          })
        } else {
          reject(userErrorsHelpers.userAlreadyExist)
        }
      }
    })
  })
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err
    callback(null, isMatch)
  })
}
