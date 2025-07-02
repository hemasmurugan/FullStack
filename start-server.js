process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/plannerpro';
process.env.PORT = '3000';

require('./server.js'); 