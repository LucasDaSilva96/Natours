module.exports = (err, req, res, next) => {
  const { status, statusCode, message } = err;
  err.statusCode = statusCode || 500;
  err.status = status || 'error';
  res.status(statusCode).json({
    status: status,
    message: message,
  });
};
