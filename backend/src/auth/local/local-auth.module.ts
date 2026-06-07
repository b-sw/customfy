import { Module } from '@nestjs/common';
import { UserReadModule } from '../../user/read/user-read.module';
import { UserWriteModule } from '../../user/write/user-write.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthLoginService } from './local-auth-login.service';

@Module({
  imports: [CustomJwtModule, UserReadModule, UserWriteModule],
  controllers: [LocalAuthController],
  providers: [LocalAuthLoginService],
})
export class LocalAuthModule {}
