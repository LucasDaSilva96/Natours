const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
// * This is for the CORS-policy of the web
app.use(cors());

// !! Morgan Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// !! Express Middleware
app.use(express.json());

// !! Own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware🥸');
//   next();
// });

// !! Own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// !! Server-side rendering (Static HTML - files) Example
//? app.use(express.static(`${__dirname}/folderName`))

// * This is for the API-endpoint (fetch-url)
// app.get('/api/v1/tours', getAllTours);

// * Get specific tour data
// app.get('/api/v1/tours/:id', getSpecificTour);

// * This is for the post request
// app.post('/api/v1/tours', createNewTour);

// * This is for the PATCH(Update a tour)
// app.post('/api/v1/tours/:id', updateTour);

// * This is for DELETING a tour
// app.delete('/api/v1/tours/:id', deleteTour);

// ? ROUTES ***
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
