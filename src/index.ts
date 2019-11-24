import { join } from 'path';

process.env.NODE_CONFIG_TS_DIR = join(__dirname, 'config');

import { App } from './app';

new App().listen()
  .then(() => console.log('🚀 Application started'))
  .catch(error => console.error(`☠️ Application error: ${error.message}`));
