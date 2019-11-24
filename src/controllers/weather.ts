import { config } from 'node-config-ts';
import { Request, Response, NextFunction } from 'express';

import { AbstractController } from './index';

import { ErrorStatus404 } from '../libs/errors/errorStatus404';
import weather from '../libs/weather';

export class WeatherController extends AbstractController {
  static cities: string[] = config.weather.cities;

  protected initRouter() {
    this.router.param('city', WeatherController.handleCityParam);

    this.router.get('/current/:city', WeatherController.handleCurrentRequest);
    this.router.get('/temperature/average', WeatherController.handleTemperatureAverageRequest);
    this.router.get('/forecast/:city', WeatherController.handleForecastRequest);
  }

  protected static handleCityParam(request: Request, response: Response, next: NextFunction, city: string) {
    const cityLowerCase = city.toLowerCase();

    if (!WeatherController.cities.includes(cityLowerCase)) {
      throw new ErrorStatus404(`City "${city}" not found`);
    }

    request.params.city = cityLowerCase;

    next();
  }

  protected static async handleCurrentRequest(request: Request, response: Response) {
    const { city } = request.params;
    const currentWeather = await weather.current(city);

    response.json({
      currentWeather: `${currentWeather.weather[0].main}: ${currentWeather.weather[0].description}`,
    });
  }

  protected static async handleTemperatureAverageRequest(request: Request, response: Response) {
    const currentWeathers = await Promise.all(WeatherController.cities.map(city => weather.current(city)));

    const tempSum = currentWeathers.reduce((previousValue, currentWeather) => previousValue + currentWeather.main.temp, 0);
    const tempAvg = Math.round(tempSum * 100 / currentWeathers.length) / 100;

    const humidityMaxObj = currentWeathers.reduce((previousValue, currentWeather) => !previousValue || currentWeather.main.humidity > previousValue.main.humidity ? currentWeather : previousValue);
    const tempMaxObj = currentWeathers.reduce((previousValue, currentWeather) => !previousValue || currentWeather.main.temp > previousValue.main.temp ? currentWeather : previousValue);

    response.json({
      tempAvg,

      humidityMax: {
        city: humidityMaxObj.name,
        value: humidityMaxObj.main.humidity,
      },
      tempMax: {
        city: humidityMaxObj.name,
        value: humidityMaxObj.main.temp,
      },
    });
  }

  protected static async handleForecastRequest(request: Request, response: Response) {
    const { city } = request.params;
    const forecast = await weather.forecast(city);

    response.json({
      forecast: forecast.list.map(forecastedWeather => ({
        temp: forecastedWeather.main.temp,
        tempMin: forecastedWeather.main.temp_min,
        tempMax: forecastedWeather.main.temp_max,
        pressure: forecastedWeather.main.pressure,
        humidity: forecastedWeather.main.humidity,
      })),
    });
  }
}
