require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const { checkConnection } = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  try {
    await checkConnection();
    logger.info(`auth-service listening on port ${env.port}`);

    app.listen(env.port, () => {
      logger.info(`auth-service listening on port ${env.port}`, {
        env: env.nodeEnv,
      });
    });
  } catch (err) {
    logger.error('Failed to start auth-service', { error: err.message });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
});

start();
