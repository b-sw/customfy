import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenResponse } from '../../shared/responses/token.response';
import { Public } from '../core/decorators/is-public';
import { LocalLoginBody } from './dto/local-login.body';
import { LocalAuthLoginService } from './local-auth-login.service';

@Public()
@Controller('auth/local')
@ApiTags('Auth (local)')
export class LocalAuthController {
  constructor(private readonly loginService: LocalAuthLoginService) {}

  @Post('login')
  @ApiResponse({ type: TokenResponse })
  public async login(@Body() payload: LocalLoginBody): Promise<TokenResponse> {
    return this.loginService.login(payload);
  }
}
