import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenResponse } from '../../shared/responses/token.response';
import { Public } from '../core/decorators/is-public';
import { GoogleLoginBody } from './dto/google-login.body';
import { GoogleAuthLoginService } from './google-auth-login.service';

@Public()
@Controller('auth/google')
@ApiTags('Auth (google)')
export class GoogleAuthController {
  constructor(private readonly loginService: GoogleAuthLoginService) {}

  @Post('login')
  @ApiResponse({ type: TokenResponse })
  public async login(@Body() payload: GoogleLoginBody): Promise<TokenResponse> {
    return this.loginService.login(payload);
  }
}
