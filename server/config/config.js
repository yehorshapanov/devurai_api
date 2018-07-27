var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/DevuraiAPI';
  process.env.JWT_SECRET = "asdfsadfl;234234";

} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/DevuraiAPITest';
  process.env.JWT_SECRET = "sadfj2390sdfnkm'mfk";
}
