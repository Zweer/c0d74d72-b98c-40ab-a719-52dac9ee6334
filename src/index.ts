import { App } from './app';

new App().listen()
  .then(() => console.log('🚀 Application started'))
  .catch(error => console.error(`☠️ Application error: ${error.message}`));
