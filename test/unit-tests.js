const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
console.log('This is what should is:',should);
const {
	runServer,
	app,
	closeServer
} = require('../server');
const {
	BlogPost
} = require('../models');
const {
	DATABASE_URL
} = require('../config.js');

chai.use(chaiHttp);

function seedData() {
  let data = [];
  for (let i = 0; i < 10; i++) {
    data.push(generateBlogPosts());
  }
  return BlogPost.insertMany(data);
}

function generateBlogPosts() {
  return {
    title: faker.name.title(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.sentence(),
    created: faker.date.past()
  };
}

function tearDownDb() {
  console.warn('Dropping the db');
  return mongoose.connection.dropDatabase();
}

describe('blog posts testing suite', function() {
  before(function() {
    return runServer(DATABASE_URL);
  });
  beforeEach(function() {
    return seedData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });
  describe('GET endpoints', function() {
    it.only('should return all the blog posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          res.body.should.have.length.of(count);
        });
    });
  });
});


