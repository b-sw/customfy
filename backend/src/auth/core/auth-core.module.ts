import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { GoogleAuthModule } from '../google/google-auth.module';
import { LocalAuthModule } from '../local/local-auth.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [CustomJwtModule, GoogleAuthModule, LocalAuthModule],
  providers: [AuthGuard, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthCoreModule {}
