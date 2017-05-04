require('dotenv').config();
exports.DATABASE_URL = process.env.DATABASE_URL;

exports.TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
  'mongodb://localhost/test-blog-app');
exports.PORT = process.env.PORT || 8080;