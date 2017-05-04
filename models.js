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

const UserSchema = mongoose.Schema({
  username: {type: String, unique: true},
  password: String,
  firstName: String,
  lastName: String,
});

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10).then(hash => hash);
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password).then(isValid => isValid);
};

UserSchema.methods.apiRepr = function() {
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
const User = mongoose.model('UserSchema', UserSchema);
module.exports = {BlogPost, User};
