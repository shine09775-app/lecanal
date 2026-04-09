const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function normalizeBasePath(value) {
  if (!value || value === '/') {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
}

const isVercelRuntime = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
const defaultApiBasePath = isVercelRuntime ? '/' : '/api';

module.exports = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  apiBasePath: normalizeBasePath(process.env.API_BASE_PATH || defaultApiBasePath),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
