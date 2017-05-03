const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const should = chai.should();
const {runServer, app, closeServer} = require('../server');
const {BlogPost} = require('../models');

chai.use('chaiHttp');

describe('it should do this', function() { 
  
  it('should do this', function() {
    return true.should.be.true;
  });
});