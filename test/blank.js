const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const {DATABASE_URL} = require('../config.js')
const {runServer, app, closeServer} = require('../server');
const {BlogPost} = require('../models');

mongoose.Promise = global.Promise;


function seedData() {
	let data = [];
	for (let i = 0; i < 10; i++) {
		data.push(generateBlogPosts());
	}
	return BlogPost.insertMany(data).then(results => {
		console.log('done');
	});
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
};
seedData();
