const express = require('express');
const app = express();
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// * This is for the CORS-policy of the web
app.use(cors());

// !! Security HTTP Middleware
app.use(helmet());

// !! Morgan Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// !! Express Middleware (Body pase, reading data from body into req.body)
app.use(
  express.json({
    limit: '10kb',
  })
);

// !! Data Sanitization Middleware (NoSQL query injection)
app.use(mongoSanitize());

// !! Data Sanitization Middleware (XSS injection)
app.use(xss());

// !! Rate limit Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: 'Too many request from this IP, please try again in 15 minutes',
});

app.use('/api', limiter);
// !! Parameter Pollution Middleware
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

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
app.use('/api/v1/reviews', reviewRouter);

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
