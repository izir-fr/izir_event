var chai = require('chai'),
  chaiHttp = require('chai-http')
express = require('express'),
app = express(),
expect = chai.expect

chai.use(chaiHttp)

// run API test
describe('Test pages return 200', () => {
  it.skip('#GET /index', (done) => {
    chai.request('http://localhost:3000')
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
  })
})
