const faker = require('faker');

function generateBlogPosts() {
  return {
    title: faker.book.title(),
    author: {
      firstName: faker.first_name(),
      lastName: faker.last_name()
    },
    content: faker.howIMetYourMother.quote(),
    created: faker.date()
  };
}

var testing = generateBlogPosts();
console.log(testing);