const env = import.meta.env
const environment = env.VITE_APP_ENV || env.MODE || 'development'
const isProduction = environment === 'production'

export const appConfig = {
  environment,
  apiUrl: env.VITE_API_URL || '',
  websocketUrl: env.VITE_WS_URL || '',
  mapbox: {
    accessToken: isProduction ? env.VITE_MAPBOX_ACCESS_TOKEN || '' : '',
    glJsUrl: env.VITE_MAPBOX_GL_JS_URL || 'https://api.mapbox.com/mapbox-gl-js/v3.25.0/mapbox-gl.js',
    glCssUrl: env.VITE_MAPBOX_GL_CSS_URL || 'https://api.mapbox.com/mapbox-gl-js/v3.25.0/mapbox-gl.css',
    streetsStyle: env.VITE_MAPBOX_STREETS_STYLE || 'mapbox://styles/mapbox/streets-v12',
    satelliteStyle: env.VITE_MAPBOX_SATELLITE_STYLE || 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  geocoding: {
    reverseUrl: env.VITE_REVERSE_GEOCODE_URL || 'https://nominatim.openstreetmap.org/reverse',
  },
}

export const API_URL = appConfig.apiUrl
