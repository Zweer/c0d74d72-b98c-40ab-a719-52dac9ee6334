import * as supertest from 'supertest';

import { App } from '../../src/app';

const app = new App();

describe('Controllers -> Errors', () => {
  beforeEach(() => app.listen());
  afterEach(() => app.close());

  it('should return the 404 error', () => supertest(app.app)
    .get('/error')
    .expect(404, { message: 'Not found: /error' }));
});
