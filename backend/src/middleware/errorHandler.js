const HttpError = require('../utils/httpError');

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  const status = error instanceof HttpError ? error.status : 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    error: {
      message,
      details: error.details || null,
    },
  });
}

module.exports = errorHandler;
