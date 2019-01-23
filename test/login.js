const request = require('supertest')

var login = (server, loginDetails, done) => {
  server
    .post('/user/login')
    .set('cookie', null)
    .send(loginDetails)
    .expect(302)
    .end((err, res) => {
        if (err) {
          throw err
        }
        var loginCookie = res.headers['set-cookie']
        done(loginCookie)
    });
}

module.exports = login
