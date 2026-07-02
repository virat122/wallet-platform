require('dotenv').config();

function required(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

module.exports = {
  port: parseInt(required('PORT', 4001), 10),
  nodeEnv: required('NODE_ENV', 'development'),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: parseInt(required('DB_PORT', 3306), 10),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: parseInt(required('DB_CONNECTION_LIMIT', 10), 10),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiry: required('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: required('JWT_REFRESH_EXPIRY', '7d'),
  },

  bcrypt: {
    saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 12), 10),
  },
};
