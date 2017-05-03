require('dotenv').config();
exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://dev:tee@ds129641.mlab.com:29641/blog-tests';
exports.PORT = process.env.PORT || 8080;
