const mongoose = require('mongoose');
const dotenv = require('dotenv');

// ** Uncaught exeptions
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down..❌');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

// ** DATABASE
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

// ? Connect Atlas to mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const app = require('./app');

// * The port for dev-sever
const port = process.env.PORT || 8000;

// * The server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// ** Unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down..❌');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
