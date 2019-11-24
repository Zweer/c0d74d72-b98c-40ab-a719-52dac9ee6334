import { expect } from 'chai';
import * as nock from 'nock';
import { config } from 'node-config-ts';
import * as supertest from 'supertest';

import { App } from '../../src/app';

const app = new App();

describe('Controllers -> Weather', () => {
  beforeEach(async () => {
    await app.listen();

    nock(`https://${config.weather.baseUrl}`)
      .get(/weather/)
      .query(params => params.q && params.q === 'milan')
      .reply(200, require('../libs/weather/mocks/current.milan'));

    nock(`https://${config.weather.baseUrl}`)
      .get(/weather/)
      .query(params => params.q && params.q === 'new york')
      .reply(200, require('../libs/weather/mocks/current.newyork'));

    nock(`https://${config.weather.baseUrl}`)
      .get(/weather/)
      .query(params => params.q && params.q === 'sydney')
      .reply(200, require('../libs/weather/mocks/current.sydney'));

    nock(`https://${config.weather.baseUrl}`)
      .get(/forecast/)
      .query(params => params.q && params.q === 'milan')
      .reply(200, require('../libs/weather/mocks/forecast.milan'));
  });

  afterEach(async () => {
    await app.close();
    nock.cleanAll();
  });

  it('should return the current weather in Milan', () => supertest(app.app)
    .get('/api/weather/current/milan')
    .expect(200, { currentWeather: 'Rain: light rain' }));

  it('should return average temperatures', () => supertest(app.app)
    .get('/api/weather/temperature/average')
    .expect(200, {
      tempAvg: 11.55,
      humidityMax: { city: 'New York', value: 93 },
      tempMax: { city: 'New York', value: 5.03 },
    }));

  it('should return forecast for Milan', () => supertest(app.app)
    .get('/api/weather/forecast/milan')
    .expect(200)
    .then(({ body }) => {
      expect(body).to.have.nested.property('forecast');
      expect(body.forecast).to.have.length(40);

      body.forecast.forEach((forecast) => {
        expect(forecast).to.have.nested.property('temp');
        expect(forecast).to.have.nested.property('tempMin');
        expect(forecast).to.have.nested.property('tempMax');
        expect(forecast).to.have.nested.property('pressure');
        expect(forecast).to.have.nested.property('humidity');
      });
    }));

  it('should return error with an invalid city', () => supertest(app.app)
    .get('/api/weather/current/dublin')
    .expect(404, { message: 'City "dublin" not found' }));
});
