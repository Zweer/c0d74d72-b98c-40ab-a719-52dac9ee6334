import { expect } from 'chai';

import { ErrorStatus } from '../../../src/libs/errors/errorStatus';

describe('Libs -> ErrorStatus', () => {
  const message = 'foo';
  const status = 500;

  it('should be an error', () => {
    expect(new ErrorStatus(message, status)).to.be.an.instanceOf(Error);
  });

  it('should have the message and the status properties', () => {
    const error = new ErrorStatus(message, status);

    expect(error).to.have.nested.property('message', message);
    expect(error).to.have.nested.property('status', status);
  });
});
