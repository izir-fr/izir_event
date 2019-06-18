var CronJob = require('cron').CronJob
var backup = require('mongodb-backup')
var cloudinary = require('cloudinary')
var os = require('os')

// Credentials
var credentials = require('../app/config/credentials')

// Cloudinary
cloudinary.config(credentials.cloudinaryCredits)

// Cron
exports.cronConfig = new CronJob('0 */30 * * * *', () => {
  // check if localhost
  if (os.hostname() !== 'PC-COM') {
    // Date
    var dateNow = new Date(Date.now())
    var file = 'backup-' + dateNow.valueOf() + '.tar'

    // Backup Setting
    backup({
      uri: credentials.mLab,
      root: './db_backup',
      collections: [ 'events', 'orders', 'users' ],
      parser: 'json',
      tar: file,
      callback: (err) => {
        if (err) {
          throw err
        } else {
          // Backup to Cloudinary
          cloudinary.v2.uploader.upload('./db_backup/' + file
            , {public_id: 'db_backup/' + file, resource_type: 'raw'}
            , (err, res) => {
              if (err) throw err
            })
        }
      }
    })
  }
}, null, true, 'Europe/Paris')
