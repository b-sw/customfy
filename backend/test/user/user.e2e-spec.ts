import * as request from 'supertest';
import { UserWriteService } from '../../src/user/write/user-write.service';
import { AuthMethod } from '../../src/user/core/enum/auth-method.enum';
import { createTestApp } from '../utils/bootstrap';

describe('UserCoreController (e2e)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let userWriteService: UserWriteService;

  beforeAll(async () => {
    bootstrap = await createTestApp();
    userWriteService = bootstrap.module.get(UserWriteService);
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('GET /users/count', () => {
    it('returns 0 when there are no users', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/users/count',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ count: 0 });
    });

    it('reflects users persisted to mongo', async () => {
      await userWriteService.create({
        email: 'someone@example.com',
        authMethod: AuthMethod.Google,
        avatarUrl: 'https://example.com/avatar.png',
      });

      const response = await request(bootstrap.app.getHttpServer()).get(
        '/users/count',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ count: 1 });
    });
  });
});
