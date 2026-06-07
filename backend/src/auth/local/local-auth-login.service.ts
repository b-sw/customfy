import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getEnvConfig } from '../../shared/config/env-config';
import { TokenResponse } from '../../shared/responses/token.response';
import { AuthMethod } from '../../user/core/enum/auth-method.enum';
import { UserReadService } from '../../user/read/user-read.service';
import { UserWriteService } from '../../user/write/user-write.service';
import { CustomJwtService } from '../custom-jwt/custom-jwt.service';
import { LocalLoginBody } from './dto/local-login.body';

@Injectable()
export class LocalAuthLoginService {
  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
  ) {}

  public async login(dto: LocalLoginBody): Promise<TokenResponse> {
    if (!getEnvConfig().auth.allowLocalLogin) {
      throw new UnauthorizedException('Local login is not enabled');
    }

    const existingUser = await this.userReadService.readByEmail(dto.email);

    if (existingUser === null) {
      const user = await this.userWriteService.create({
        authMethod: AuthMethod.Local,
        email: dto.email,
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
