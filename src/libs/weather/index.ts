import '../axios';
import axios from 'axios';
import { config } from 'node-config-ts';

import { CurrentDto } from './dto/current.dto';
import { ForecastDto } from './dto/forecast.dto';

type endpoint = 'current' | 'forecast';

class Weather {
  async current(city: string): Promise<CurrentDto> {
    return this.request<CurrentDto>('current', city);
  }

  async forecast(city: string): Promise<ForecastDto> {
    return this.request<ForecastDto>('forecast', city);
  }

  protected async request<T>(endpoint: endpoint, city: string): Promise<T> {
    const { data } = await axios.get<T>(`https://${config.weather.baseUrl}/${config.weather.version}/${config.weather.endpoints[endpoint]}`, {
      params: {
        q: city,
        APPID: config.weather.key,
        units: 'metric',
      },
    });

    return data;
  }
}

export default new Weather();
