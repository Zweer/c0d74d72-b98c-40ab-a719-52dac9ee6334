import { expect } from 'chai';
import * as nock from 'nock';

import weather from '../../../src/libs/weather';

const currentWeatherInMilanMock = require('./mocks/current.milan');
const forecastWeatherInMilanMock = require('./mocks/forecast.milan');

describe('Lib -> Weather', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('it should return the current weather in milan', async () => {
    const scope = nock(/.*/).get(/.*/).reply(200, currentWeatherInMilanMock);

    const currentWeather = await weather.current('milan');

    scope.done();

    expect(currentWeather).to.deep.equal(currentWeatherInMilanMock);
  });

  it('it should return the forecast weather in milan', async () => {
    const scope = nock(/.*/).get(/.*/).reply(200, forecastWeatherInMilanMock);

    const forecast = await weather.forecast('milan');

    scope.done();

    expect(forecast).to.deep.equal(forecastWeatherInMilanMock);
  });
});
