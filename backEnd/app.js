const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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

// ** Route handler
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server.`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// ** Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
