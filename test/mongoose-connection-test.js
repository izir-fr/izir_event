var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
require('sinon-mongoose');

var User = require('../models/user.js');

describe("Get all user", () => {

   // Test will pass if we get all users
  it("should return all user", (done) => {
    var UserMock = sinon.mock(User);
    var expectedResult = {status: true, user: []};
    UserMock.expects('find').yields(null, expectedResult);
    User.find( (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });

  // Test will pass if we fail to get a user
  it("should return error", (done) => {
    var UserMock = sinon.mock(User);
    var expectedResult = {status: false, error: "Something went wrong"};
    UserMock.expects('find').yields(expectedResult, null);
    User.find( (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.status).to.not.be.true;
      done();
    });
  });

});

// Test will pass if the user is saved
describe("Post a new user", () => {
  it("should create new post", (done) => {
    var UserMock = sinon.mock(new User({ user: 'Save new user from mock'}));
    var user = UserMock.object;
    var expectedResult = { status: true };
    UserMock.expects('save').yields(null, expectedResult);
    user.save( (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });
  // Test will pass if the user is not saved
  it("should return error, if post not saved", (done) => {
    var UserMock = sinon.mock(new User({ user: 'Save new user from mock'}));
    var user = UserMock.object;
    var expectedResult = { status: false };
    UserMock.expects('save').yields(expectedResult, null);
    user.save( (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.status).to.not.be.true;
      done();
    });
  });
});

// Test will pass if the user is updated based on an ID
describe("Update a new user by id", () => {
  it("should updated a user by id", (done) => {
    var UserMock = sinon.mock(new User({ name: 'test name'}));
    var user = UserMock.object;
    var expectedResult = { status: true };
    UserMock.expects('update').withArgs({_id: 12345}).yields(null, expectedResult);
    user.update({_id: 12345}, (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });
  // Test will pass if the user is not updated based on an ID
  it("should return error if update action is failed", (done) => {
    var UserMock = sinon.mock(new User({ name: 'test name'}));
    var user = UserMock.object;
    var expectedResult = { status: false };
    UserMock.expects('update').withArgs({_id: 12345}).yields(expectedResult, null);
    user.update({_id: 12345}, (err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.status).to.not.be.true;
      done();
    });
  });
});