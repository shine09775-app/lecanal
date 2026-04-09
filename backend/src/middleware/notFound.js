function notFound(req, res) {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} was not found`,
    },
  });
}

module.exports = notFound;
