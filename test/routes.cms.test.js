const chai = require('chai')
const request = require('supertest')
const app = require('./../app')

const login = require('./login')
let server = request(app)

// chai config
const assert = chai.assert
const should = chai.should()

var user = {
  'username': 'admin',
  'password': process.env.PASSWORD
}

// test routes CMS
describe('routes : cms', () => {
  // /index
  describe('GET /', () => {
    it('Not log user should respond index page 200 status', (done) => {
      server
        .get('/')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })
  // /index redirect to finder for logged user
  describe('GET /', () => {
    it('log user should redirect finder page 302 status', (done) => {
      login(server, user, (cookie) => {
        server
          .get('/')
          .set('cookie', cookie)
          .end((err, res) =>{
            // there should be a 302 status code
            res.status.should.equal(302)
            // redirect url should be '/event/finder'
            res.header.location.should.equal('/event/finder')
            done()
          })
      })
    })
  })

  // /info/entreprise
  describe('GET /info/entreprise', () => {
    it('should respond entreprise page 200 status', (done) => {
      server
        .get('/info/entreprise')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/partenaires
  describe('GET /info/partenaires', () => {
    it('should respond partenaires page 200 status', (done) => {
      server
        .get('/info/partenaires')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/medias
  describe('GET /info/medias', () => {
    it('should respond medias page 200 status', (done) => {
      server
        .get('/info/medias')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/tarifs
  describe('GET /info/tarifs', () => {
    it('should respond tarifs page 200 status', (done) => {
      server
        .get('/info/tarifs')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/contact
  describe('GET /info/contact', () => {
    it('should respond contact page 200 status', (done) => {
      server
        .get('/info/contact')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/mentions-legales
  describe('GET /info/mentions-legales', () => {
    it('should respond mentions-legales page 200 status', (done) => {
      server
        .get('/info/mentions-legales')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/cgv
  describe('GET /info/cgv', () => {
    it('should respond cgv page 200 status', (done) => {
      server
        .get('/info/cgv')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/cgu
  describe('GET /info/cgu', () => {
    it('should respond cgu page 200 status', (done) => {
      server
        .get('/info/cgu')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/faq
  describe('GET /info/faq', () => {
    it('should respond faq page 200 status', (done) => {
      server
        .get('/info/faq')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/comptabilite
  describe('GET /info/comptabilite', () => {
    it('should respond comptabilite page 200 status', (done) => {
      server
        .get('/info/comptabilite')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/securite
  describe('GET /info/securite', () => {
    it('should respond securite page 200 status', (done) => {
      server
        .get('/info/securite')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/commande
  describe('GET /info/commande', () => {
    it('should respond commande page 200 status', (done) => {
      server
        .get('/info/commande')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })

  // /info/remboursement
  describe('GET /info/remboursement', () => {
    it('should respond remboursement page 200 status', (done) => {
      server
        .get('/info/remboursement')
        .end((err, res) => {
          // there should be no errors
          should.not.exist(err)
          // there should be a 200 status code
          res.status.should.equal(200)
          done()
        })
    })
  })
})

