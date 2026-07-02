const env = import.meta.env

export const appConfig = {
  environment: env.VITE_APP_ENV || env.MODE || 'development',
  apiUrl: env.VITE_API_URL || '',
}

export const API_URL = appConfig.apiUrl
