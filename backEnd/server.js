const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
const port = Number(process.env.PORT) || 8000;

// * The server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
