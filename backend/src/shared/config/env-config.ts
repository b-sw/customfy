import 'dotenv/config';
import { getOurEnv, OurEnv } from '../types/our-env.enum';

export interface EnvConfig {
  mongo: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    allowLocalLogin: boolean;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      /** Used for local development when the client sends forceLocalLogin. */
      redirectUriAlternative: string;
    };
  };
  /** Public URL of the web app (production), used to build redirect links. */
  webAppUrl: string;
  /** Localhost web app URL, used when the client sends forceLocalLogin. */
  webAppUrlAlternative: string;
}

interface EnvConfigs {
  [OurEnv.Prod]: EnvConfig;
  [OurEnv.Dev]: EnvConfig;
}

const baseConfig: EnvConfig = {
  mongo: {
    url: process.env.MONGO_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    allowLocalLogin: process.env.ALLOW_LOCAL_LOGIN === 'true',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      redirectUriAlternative:
        process.env.GOOGLE_REDIRECT_URI_ALTERNATIVE ||
        process.env.GOOGLE_REDIRECT_URI,
    },
  },
  webAppUrl: process.env.WEB_APP_URL || 'http://localhost:5173',
  webAppUrlAlternative:
    process.env.WEB_APP_URL_ALTERNATIVE ||
    process.env.WEB_APP_URL ||
    'http://localhost:5173',
};

export const EnvConfigs: EnvConfigs = {
  [OurEnv.Prod]: baseConfig,
  [OurEnv.Dev]: baseConfig,
};

export function getEnvConfig(): EnvConfig {
  const env = getOurEnv();
  return EnvConfigs[env];
}

/**
 * Resolve the web app URL the same way Google's redirect URI is resolved:
 * use the localhost alternative when the request is a local-development login,
 * otherwise the production URL.
 */
export function getWebAppUrl(forceLocalLogin?: boolean): string {
  const config = getEnvConfig();
  return forceLocalLogin ? config.webAppUrlAlternative : config.webAppUrl;
}
