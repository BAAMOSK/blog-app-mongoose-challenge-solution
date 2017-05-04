const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const blogPostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now}
});

const User = mongoose.Schema({
  username: String,
  password: {type: String},
  firstName: String,
  lastName: String,
});

User.method.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

User.method.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

User.method.apiRepr = function() {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
  };
};

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  };
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
