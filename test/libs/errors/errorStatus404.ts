import { expect } from 'chai';

import { ErrorStatus } from '../../../src/libs/errors/errorStatus';
import { ErrorStatus404 } from '../../../src/libs/errors/errorStatus404';

describe('Libs -> ErrorStatus404', () => {
  const message = 'foo';
  let error;

  beforeEach('Instantiating the error', () => {
    error = new ErrorStatus404(message);
  });

  it('should be an instance of ErrorStatus and Error', () => {
    expect(error).to.be.an.instanceOf(ErrorStatus);
    expect(error).to.be.an.instanceOf(Error);
  });

  it('should have the message and status properties', () => {
    expect(error).to.have.nested.property('message', message);
    expect(error).to.have.nested.property('status', 404);
  });
});
