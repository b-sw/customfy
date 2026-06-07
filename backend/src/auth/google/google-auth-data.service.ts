import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getEnvConfig } from '../../shared/config/env-config';

interface GoogleTokenResponse {
  access_token?: string;
}

interface GoogleUserInfoResponse {
  email?: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthDataService {
  public async getAccessToken(
    code: string,
    forceLocalLogin?: boolean,
  ): Promise<string> {
    const config = getEnvConfig().oauth.google;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: decodeURIComponent(code),
        grant_type: 'authorization_code',
        redirect_uri: forceLocalLogin
          ? config.redirectUriAlternative
          : config.redirectUri,
      }),
    });

    const data = (await response.json()) as GoogleTokenResponse;

    if (!data.access_token) {
      throw new UnauthorizedException(
        'Failed to exchange Google authorization code',
      );
    }

    return data.access_token;
  }

  public async getGoogleEmailAndAvatar(
    accessToken: string,
  ): Promise<{ email: string; avatar: string }> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const user = (await response.json()) as GoogleUserInfoResponse;

    return { email: user.email ?? '', avatar: user.picture ?? '' };
  }
}
