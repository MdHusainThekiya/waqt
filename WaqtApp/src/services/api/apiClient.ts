import { API_BASE_URL } from '@/constants/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

export const apiClient = async <T>(
  endpoint: string,
  { body, ...customConfig }: RequestOptions = {},
): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    return Promise.reject(data);
  }
};
