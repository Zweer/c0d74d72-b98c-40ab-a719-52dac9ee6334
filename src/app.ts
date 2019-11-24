import * as express from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';
import { config } from 'node-config-ts';
import { join } from 'path';
import { absolutePath as pathToSwaggerUi } from 'swagger-ui-dist';

import { AbstractController } from './controllers';
import { WeatherController } from './controllers/weather';

export class App {
  public app: express.Express;
  private server: Server;

  constructor() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
  }

  private initServer() {
    this.app = express();
    this.server = new Server(this.app);

    this.server.on('error', error => console.error(`☠️ Server error: ${error.message}`));

    console.log('Server initialized');
  }

  private initMiddleware() {
    this.app.use(morgan('combined'));

    console.log('Middleware initialized');
  }

  private initRoutes() {
    this.app.use('/docs/api', express.static(pathToSwaggerUi()));
    this.app.use('/docs/swagger', express.static(join(__dirname, '..', 'docs', 'swagger')));

    console.log('Swagger initialized');

    new WeatherController().apply(this.app);

    this.app.use(AbstractController.handle404);
    this.app.use(AbstractController.handle500);
  }

  async listen() {
    const port = typeof config.server.port === 'undefined'  ? 3000  : config.server.port;

    await new Promise((resolve, reject) => {
      this.server.listen(port, () => resolve());
      this.server.once('error', error => reject(error));
    });

    console.log(`Server listening on port ${port}`);
  }

  async close() {
    await new Promise((resolve, reject) =>
      this.server.close(err => (err ? reject(err) : resolve())));

    this.server.removeAllListeners();
  }
}
