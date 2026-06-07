import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenResponse } from '../../shared/responses/token.response';
import { AuthMethod } from '../../user/core/enum/auth-method.enum';
import { UserReadService } from '../../user/read/user-read.service';
import { UserWriteService } from '../../user/write/user-write.service';
import { CustomJwtService } from '../custom-jwt/custom-jwt.service';
import { GoogleAuthDataService } from './google-auth-data.service';
import { GoogleLoginBody } from './dto/google-login.body';

@Injectable()
export class GoogleAuthLoginService {
  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
    private readonly googleDataService: GoogleAuthDataService,
  ) {}

  public async login(dto: GoogleLoginBody): Promise<TokenResponse> {
    const accessToken = await this.googleDataService.getAccessToken(
      dto.googleCode,
      dto.forceLocalLogin,
    );

    const { email, avatar } =
      await this.googleDataService.getGoogleEmailAndAvatar(accessToken);

    if (!email) {
      throw new UnauthorizedException('Email not found in Google response');
    }

    const existingUser = await this.userReadService.readByEmail(email);

    if (existingUser === null) {
      const user = await this.userWriteService.create({
        authMethod: AuthMethod.Google,
        email,
        avatarUrl: avatar,
      });

      return {
        token: await this.jwtService.sign({ id: user.id }),
        isNewUser: true,
      };
    }

    return {
      token: await this.jwtService.sign({ id: existingUser.id }),
      isNewUser: false,
    };
  }
}
