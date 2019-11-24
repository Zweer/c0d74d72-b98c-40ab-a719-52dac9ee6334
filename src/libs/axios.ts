import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as uuid from 'uuid/v4';

type CustomConfig = {
  startTime: [number, number];
  uuid: string;
};
type AxiosRequestConfigWithStartTimeAndId = AxiosRequestConfig & CustomConfig;
type AxiosResponseWithStartTimeAndId = AxiosResponse & { config: AxiosRequestConfig & CustomConfig };

axios.interceptors.request.use((config: AxiosRequestConfigWithStartTimeAndId) => {
  const id = uuid();

  console.log('request', id, {
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data,
  });

  config.startTime = process.hrtime();
  config.uuid = id;

  return config;
});

function retrieveIdAndDuration(response: AxiosResponseWithStartTimeAndId) {
  const [durationSeconds, durationNanoseconds] = process.hrtime(response.config.startTime);
  const durationMicroseconds = durationSeconds * 1000000 + Math.floor(durationNanoseconds / 1000);
  const durationMilliseconds = durationMicroseconds / 1000;

  const id = response.config.uuid;

  return { id, durationMilliseconds };
}

axios.interceptors.response.use((response: AxiosResponseWithStartTimeAndId) => {
  const { id, durationMilliseconds } = retrieveIdAndDuration(response);

  console.log('response', id, {
    status: response.status,
    duration: durationMilliseconds,
  });

  return response;
}, (error: Error & { config: AxiosRequestConfigWithStartTimeAndId, response: AxiosResponseWithStartTimeAndId }) => {
  const { id, durationMilliseconds } = retrieveIdAndDuration(error.response);

  console.log('response', id, {
    status: error.response.status,
    duration: durationMilliseconds,
  });

  console.error('error', id, error.response.data);

  return Promise.reject(error);
});
