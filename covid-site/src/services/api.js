import axios from 'axios';
import qs from 'qs';
import Config from '../Config';

let token = localStorage.getItem('token');

const getAuth = () => token && `Bearer ${token}`;

const instance = axios.create({
  baseURL: Config.apiURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  transformResponse: data => (data ? JSON.parse(data) : undefined),
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'brackets' });
  }
});

const METHODS = ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'];

const httpMethods = METHODS.map(
  method => async (url, headers = {}, data, params) =>
    instance.request({
      url,
      method,
      headers: { Authorization: getAuth(), ...headers },
      data,
      params
    })
);

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.isAxiosError) {
      const { status } = error.response || {};
      if (status === 401) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);
const uploadFile = async (url, fileName, file) => {
  const data = new FormData();
  data.append('data', file, fileName);
  return instance.post(url, data, {
    headers: {
      Authorization: getAuth(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const [get, put, post, patch, del, head, options] = httpMethods;

export const authenticate = async accessToken => {
  token = accessToken;
  const { status } = (await post('/users')) || {};
  if (status === 202) {
    localStorage.setItem('token', accessToken);
  }
};

export default {
  authenticate,
  uploadFile,
  get,
  put,
  post,
  patch,
  del,
  head,
  options
};
