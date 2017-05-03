const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const should = chai.should();
const {runServer, app, closeServer} = require('../server');
const {BlogPost} = require('../models');

chai.use('chaiHttp');

function seedData() {
  let data = [];
  for(let i = 0; i < 10; i++) {
    data.push(generateBlogPosts());
  }
  return BlogPost.insertMany(data);
}

function generateBlogPosts() {
  return {
    title: faker.book.title,
    author: {
      firstName: faker.first_name,
      lastName: faker.last_name
    },
    content: faker.howIMetYourMother.quote,
    created: faker.date()
  };
};



describe('it should do this', function() {   
  it('should do this', function() {
    return true.should.be.true;
  });
});
