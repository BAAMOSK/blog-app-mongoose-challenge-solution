const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
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
    it('should return all the blog posts', function() {
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
    it('should return blog posts with the right fields', function() {
      let resPost;
      return chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.forEach(function(post) {
          post.should.be.a('object');
          post.should.include.keys('id', 'author', 'content', 'created', 'title');
        });
        resPost = res.body[0];
        return BlogPost.findById(resPost.id);
      })
			.then(function(post) {
				// console.log(resPost);
				// console.log(resPost.author);
				// console.log(post.author);
  resPost.id.should.equal(post.id);
  resPost.title.should.equal(post.title);
  resPost.author.should.equal(post.authorName);
  resPost.content.should.equal(post.content);
});
    });
  });

  describe('POST endpoints', function() {
    it('should add a new blog post', function () {
      const newPost = generateBlogPosts();
      return chai.request(app)
			.post('/posts')
			.send(newPost)
			.then(function(res) {
  res.should.have.status(201);
  res.body.should.be.a('object');
  res.should.be.json;
  res.body.should.include.keys('id', 'author', 'content', 'created', 'title');
  res.body.should.not.be.null;
  res.body.id.should.equal(res.body.id);
});
    });
  });

  describe('PUT endpoints', function() {
    it('should update fields you send over', function() {
      const updateData = {
        title: faker.name.title()
      };
      const oldItemAuthor = {};
      return BlogPost
				.findOne()
				.exec()
				.then(function(post) {
  updateData.id = post.id;
  oldItemAuthor.author = post.authorName;
  return chai.request(app)
					.put(`/posts/${post.id}`)
					.send(updateData);
})
				.then(function(res) {
  res.should.have.status(201);
  console.log(oldItemAuthor);

  return BlogPost.findById(updateData.id).exec();
})
				.then(function(post) {
  post.authorName.should.equal(oldItemAuthor.author);
  post.title.should.equal(updateData.title);
});
    });
  });

  describe('DELETE endpoints', function() {
    it.only('it should delete post', function() {
      let post;
      return BlogPost
			.findOne()
			.exec()
			.then(function(_post) {
  post = _post;
  return chai.request(app)				
				.delete(`/posts/${post.id}`);								
})
			.then(function(res) {
  res.should.have.status(204);
  return BlogPost.findById(post.id);
});
    });
  });

});