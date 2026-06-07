import * as request from 'supertest';
import { CustomJwtService } from '../../src/auth/custom-jwt/custom-jwt.service';
import { AuthMethod } from '../../src/user/core/enum/auth-method.enum';
import { UserWriteService } from '../../src/user/write/user-write.service';
import { createTestApp } from '../utils/bootstrap';

describe('Auth (e2e)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let userWriteService: UserWriteService;
  let jwtService: CustomJwtService;

  beforeAll(async () => {
    bootstrap = await createTestApp();
    userWriteService = bootstrap.module.get(UserWriteService);
    jwtService = bootstrap.module.get(CustomJwtService);
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('GET /users/me', () => {
    it('returns 401 without a token', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/users/me',
      );

      expect(response.status).toEqual(401);
    });

    it('returns 401 with an invalid token', async () => {
      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer not-a-real-token');

      expect(response.status).toEqual(401);
    });

    it('returns the current user with a valid token', async () => {
      const user = await userWriteService.create({
        email: 'auth@example.com',
        authMethod: AuthMethod.Google,
        avatarUrl: 'https://example.com/avatar.png',
      });

      const token = await jwtService.sign({ id: user.id });

      const response = await request(bootstrap.app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        id: user.id,
        email: 'auth@example.com',
        authMethod: AuthMethod.Google,
      });
    });
  });
});
