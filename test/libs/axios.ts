require('../../src/libs/axios');
import axios from 'axios';
import * as nock from 'nock';
import * as sinon from 'sinon';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Libs -> Axios', () => {
  let sandbox;

  before('Adding the interceptors', () => {
    require('../../src/libs/axios');
  });

  beforeEach('Initializing sandbox and spies', () => {
    sandbox = sinon.createSandbox();
    sinon.spy(console, 'log');
    sinon.spy(console, 'error');
  });

  afterEach('Removing spies', () => {
    // @ts-ignore
    console.log.restore();
    // @ts-ignore
    console.error.restore();
    sandbox.restore();
    nock.cleanAll();
  });

  it('should log request and response metadata', async () => {
    const scope = nock(/.*/).get(/.+/).reply(200, []);

    await axios.get('https://www.example.com');

    scope.done();

    expect(console).to.have.nested.property('log.firstCall.args.0', 'request');
    expect(console).to.have.nested.property('log.firstCall.args.1');
    expect(console).to.have.nested.property('log.firstCall.args.2');
    expect(console).to.have.nested.property('log.firstCall.args.2.method', 'get');
    expect(console).to.have.nested.property('log.firstCall.args.2.url', 'https://www.example.com');
    expect(console).to.have.nested.property('log.firstCall.args.2.url', 'https://www.example.com');
    expect(console).to.have.nested.property('log.firstCall.args.2.params');
    expect(console).to.have.nested.property('log.firstCall.args.2.data');

    // @ts-ignore
    const id = console.log.firstCall.args[1];

    expect(console).to.have.nested.property('log.secondCall.args.0', 'response');
    expect(console).to.have.nested.property('log.secondCall.args.1', id);
    expect(console).to.have.nested.property('log.secondCall.args.2');
    expect(console).to.have.nested.property('log.secondCall.args.2.status', 200);
    expect(console).to.have.nested.property('log.secondCall.args.2.duration');
  });

  it('should log request and response metadata (error case)', async () => {
    const status = 404;
    const message = 'foo';
    const scope = nock(/.*/).get(/.+/).reply(status, message);

    await expect(axios.get('https://www.example.com')).to.be.rejectedWith('Request failed with status code 404');

    scope.done();

    expect(console).to.have.nested.property('log.firstCall.args.0', 'request');
    expect(console).to.have.nested.property('log.firstCall.args.1');
    expect(console).to.have.nested.property('log.firstCall.args.2');
    expect(console).to.have.nested.property('log.firstCall.args.2.method', 'get');
    expect(console).to.have.nested.property('log.firstCall.args.2.url', 'https://www.example.com');
    expect(console).to.have.nested.property('log.firstCall.args.2.url', 'https://www.example.com');
    expect(console).to.have.nested.property('log.firstCall.args.2.params');
    expect(console).to.have.nested.property('log.firstCall.args.2.data');

    // @ts-ignore
    const id = console.log.firstCall.args[1];

    expect(console).to.have.nested.property('log.secondCall.args.0', 'response');
    expect(console).to.have.nested.property('log.secondCall.args.1', id);
    expect(console).to.have.nested.property('log.secondCall.args.2');
    expect(console).to.have.nested.property('log.secondCall.args.2.status', status);
    expect(console).to.have.nested.property('log.secondCall.args.2.duration');

    expect(console).to.have.nested.property('error.firstCall.args.0', 'error');
    expect(console).to.have.nested.property('error.firstCall.args.1', id);
    expect(console).to.have.nested.property('error.firstCall.args.2', message);
  });
});
