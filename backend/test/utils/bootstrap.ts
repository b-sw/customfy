import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AuthCoreModule } from '../../src/auth/core/auth-core.module';
import { HealthModule } from '../../src/health/health.module';
import { UserEntity } from '../../src/user/core/entities/user.entity';
import { UserCoreModule } from '../../src/user/core/user-core.module';
import {
  closeInMemoryMongoServer,
  rootMongooseTestModule,
} from './mongo-in-memory-server';

export interface TestApp {
  app: INestApplication;
  module: TestingModule;
  models: {
    userModel: Model<UserEntity>;
  };
  methods: {
    clearDatabase: () => Promise<void>;
    beforeEach: () => Promise<void>;
    afterAll: () => Promise<void>;
  };
}

export async function createTestApp(): Promise<TestApp> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      rootMongooseTestModule(),
      AuthCoreModule,
      HealthModule,
      UserCoreModule,
    ],
  }).compile();

  const app = module.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();

  const userModel: Model<UserEntity> = module.get(
    getModelToken(UserEntity.name),
  );

  const clearDatabase = async () => {
    await userModel.deleteMany({});
  };

  const beforeEach = async () => {
    await clearDatabase();
  };

  const afterAll = async () => {
    await app.close();
    await closeInMemoryMongoServer();
  };

  return {
    app,
    module,
    models: { userModel },
    methods: { clearDatabase, beforeEach, afterAll },
  };
}
