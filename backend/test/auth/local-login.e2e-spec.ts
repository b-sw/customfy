import * as request from 'supertest';
import { createTestApp } from '../utils/bootstrap';

interface TokenBody {
  token: string;
  isNewUser: boolean;
}

describe('Local auth (e2e)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('POST /auth/local/login', () => {
    it('creates a user and returns a usable JWT', async () => {
      const login = await request(bootstrap.app.getHttpServer())
        .post('/auth/local/login')
        .send({ email: 'local@customfy.dev' });

      expect(login.status).toEqual(201);
      const body = login.body as TokenBody;
      expect(body.token).toEqual(expect.any(String));
      expect(body.isNewUser).toBe(true);

      const me = await request(bootstrap.app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${body.token}`);

      expect(me.status).toEqual(200);
      expect(me.body).toMatchObject({
        email: 'local@customfy.dev',
        authMethod: 'local',
      });
    });

    it('logs the same user in on a second call', async () => {
      await request(bootstrap.app.getHttpServer())
        .post('/auth/local/login')
        .send({ email: 'repeat@customfy.dev' });

      const second = await request(bootstrap.app.getHttpServer())
        .post('/auth/local/login')
        .send({ email: 'repeat@customfy.dev' });

      expect(second.status).toEqual(201);
      expect((second.body as TokenBody).isNewUser).toBe(false);
    });

    it('rejects an invalid email', async () => {
      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/local/login')
        .send({ email: 'not-an-email' });

      expect(response.status).toEqual(400);
    });
  });
});
