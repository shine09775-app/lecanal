const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const env = require('./config/env');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  })
);
app.use(express.json());
app.use(env.apiBasePath, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
