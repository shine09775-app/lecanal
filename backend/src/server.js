const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  // Keep startup logging minimal for local ops.
  console.log(`Backend listening on http://localhost:${env.port}`);
});
