const chai = require('chai')
const request = require('supertest')
const server = require('./../app')

// chai config
const assert = chai.assert
const should = chai.should()

// test routes CMS
describe('routes : cms', () => {
  // /index
  describe('GET /', () => {
    it('should respond index page 200 status', (done) => {
      request(server)
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

  // /info/entreprise
  describe('GET /info/entreprise', () => {

  })

  // /info/partenaires
  describe('GET /info/partenaires', () => {

  })

  // /info/medias
  describe('GET /info/medias', () => {

  })

  // /info/tarifs
  describe('GET /info/tarifs', () => {

  })

  // /info/contact
  describe('GET /info/contact', () => {

  })

  // /info/mentions-legales
  describe('GET /info/mentions-legales', () => {

  })

  // /info/cgv
  describe('GET /info/cgv', () => {

  })

  // /info/cgu
  describe('GET /info/cgu', () => {

  })

  // /info/faq
  describe('GET /info/faq', () => {

  })

  // /info/comptabilite
  describe('GET /info/comptabilite', () => {

  })

  // /info/securite
  describe('GET /info/securite', () => {

  })

  // /info/commande
  describe('GET /info/commande', () => {

  })

  // /info/remboursement
  describe('GET /info/remboursement', () => {

  })
})

