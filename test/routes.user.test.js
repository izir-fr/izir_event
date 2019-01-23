const chai = require('chai')
const request = require('supertest')
const app = require('./../app')

const login = require('./login')
let server = request(app)

// chai config
const assert = chai.assert
const should = chai.should()

var user = {
  'email': process.env.LOGIN_EMAIL,
  'password': process.env.LOGIN_PASSWORD
}

// test routes CMS
describe('routes : user', () => {
  describe('GET /user/register', () => {
    it('Not logged user should respond register page 200 status', (done) => {
      server
        .get('/user/register')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })
  describe('POST /user/register', () => {
    it('Post register form should respond 200 status', (done) => {
      server
        .post('/user/register')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/login', () => {
    it('Not logged user should respond login page 200 status', (done) => {
      server
        .get('/user/login')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('POST /user/profil', () => {
    it('POST profil form should respond 200 status', (done) => {
      server
        .post('/user/profil')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/profil', () => {
    it('Logged user should redirect profil page 302 status', (done) => {
      server
        .get('/user/profil')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/profil/:id', () => {
    it('Logged user should respond profil page 200 status', (done) => {
      server
        .get('/user/profil/123')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/profil/edit/:id', () => {
    it('Logged user should respond edit profil page page 200 status', (done) => {
      login(server, user, (cookie) => {
        server
          .get('/user/profil/edit/123')
          .set('cookie', cookie)
          .end((err, res) => {
            // console.log(res)
            done()
          })        
      })
    })
  }) 

  describe('POST /user/profil/edit/:id', () => {
    it('User post edit profil form should respond 200 status', (done) => {
      server
        .post('/user/profil/edit/123')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/password-forgot', () => {
    it('Not logged user should respond password forgot page 200 status', (done) => {
      server
        .get('/user/password-forgot')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('POST /user/password-forgot', () => {
    it('Not logged user post form password forgot form should respond 200 status', (done) => {
      server
        .get('')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/reset/:token', () => {
    it('Not logged user should respond reset token page 200 status', (done) => {
      server
        .get('/user/reset/xyz')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('POST /user/reset/:token', () => {
    it('Not logged user post reset token should respond 200 status', (done) => {
      server
        .post('/user/reset/xyz')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/certificat/:id', () => {
    it('Logged user should respond certificat page 200 status', (done) => {
      server
        .get('/user/certificat/123')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('POST /user/certificat/:id', () => {
    it('Logged user post certifcat form should respond 200 status', (done) => {
      server
        .post('/user/certificat/123')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/amis', () => {
    it('Logged user should respond send to friend page 200 status', (done) => {
      server
        .get('/user/amis')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('POST /user/amis/:id', () => {
    it('Logged user post message form should respond 200 status', (done) => {
      server
        .post('/user/amis/123')
        .end((err, res) => {
          done()
        })
    })
  }) 

  describe('GET /user/logout', () => {
    it('Logged user send logout requist should redirect to home whit 302 status', (done) => {
      server
        .get('/user/logout')
        .end((err, res) => {
          done()
        })
    })
  }) 

})
