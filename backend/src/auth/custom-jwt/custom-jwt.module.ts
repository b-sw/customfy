import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { getEnvConfig } from '../../shared/config/env-config';
import { CustomJwtService } from './custom-jwt.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: getEnvConfig().auth.jwtSecret,
      signOptions: {
        expiresIn: getEnvConfig().auth.jwtExpiresIn as SignOptions['expiresIn'],
      },
    }),
  ],
  providers: [CustomJwtService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}
