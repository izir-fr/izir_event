const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const server = require('../app')

// test routes CMS
// describe('routes : cms', () => { 
//   describe('GET /', () => {
//     it('should GET index page', (done) => {
//       chai.request(server)
//       .get('/')
//       .end((err, res) => {
//         expect(res).to.have.headers
//         expect(res).to.have.header('user', null)
//         expect(res.status, 'status handler').equal(200)
//         done()
//       })
//     })
//   })
// })
