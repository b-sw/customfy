import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthCoreModule } from './auth/core/auth-core.module';
import { getEnvConfig } from './shared/config/env-config';
import { HealthModule } from './health/health.module';
import { UserCoreModule } from './user/core/user-core.module';

@Module({
  imports: [
    MongooseModule.forRoot(getEnvConfig().mongo.url),
    AuthCoreModule,
    HealthModule,
    UserCoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
