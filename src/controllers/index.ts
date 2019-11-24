import { config } from 'node-config-ts';
import { Router, Request, Response, NextFunction, Express } from 'express';

import { ErrorStatus404 } from '../libs/errors/errorStatus404';
import { ErrorStatus } from '../libs/errors/errorStatus';

export abstract class AbstractController {
  protected router: Router;

  constructor() {
    this.router = Router();

    this.initRouter();
    this.promisifyMiddleware();
  }

  protected abstract initRouter();

  protected promisifyMiddleware() {
    this.router.stack.forEach(({ route }) => {
      if (route) {
        route.stack.forEach((stack) => {
          const oldHandle = stack.handle;

          // eslint-disable-next-line no-param-reassign
          stack.handle = stack.handle.constructor.name === 'AsyncFunction' ? AbstractController.wrapPromise(oldHandle) : AbstractController.wrapTryCatch(oldHandle);
        });
      }
    });
  }

  static wrapPromise(middleware) {
    return (request, response, next) => {
      middleware(request, response, next)
        .catch(next);
    };
  }

  static wrapTryCatch(middleware) {
    return (request, response, next) => {
      try {
        middleware(request, response, next);
      } catch (error) {
        next(error);
      }
    };
  }

  apply(app: Express) {
    const nameUpperCase = this.constructor.name.replace('Controller', '');
    const name = `${nameUpperCase.substr(0, 1).toLowerCase()}${nameUpperCase.substr(1)}`;

    app.use(`/api/${name}`, this.router);

    console.log(`Controller "${name}" initialized`);
  }

  static handle404(request: Request, response: Response, next: NextFunction) {
    next(new ErrorStatus404(`Not found: ${request.url}`));
  }

  static handle500(rawError: Error | ErrorStatus, request: Request, response: Response, next: NextFunction) { // eslint-disable-line no-unused-vars
    const error = typeof rawError === 'string' ? new Error(rawError) : rawError;

    const { message, stack } = error;
    const status = error instanceof ErrorStatus ? error.status : 500;

    if (status !== 404) {
      console.log(message);
      console.trace(stack);
    }

    response.status(status);

    response.json({
      message: config.environment === 'development' || config.environment === 'test' ? message : error.message,
      stack: config.environment === 'development' ? stack : undefined,
    });
  }
}
