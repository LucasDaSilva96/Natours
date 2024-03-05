const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// * The port for dev-sever
const port = Number(process.env.PORT) || 8000;

// * The server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
