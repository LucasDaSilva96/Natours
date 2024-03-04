const app = require('./app');

// * The port for dev-sever
const port = 8000;

// * The server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
