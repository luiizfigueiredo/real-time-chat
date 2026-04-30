import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('auth flow should login with invitation code and protect /auth/me with JWT', async () => {
    const inviteCodeResponse = await request(app.getHttpServer())
      .post('/auth/invite-codes')
      .send({ ttlSeconds: 1200 })
      .expect(201);

    const inviteCode = inviteCodeResponse.body.code as string;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ code: inviteCode, displayName: 'guilherme' })
      .expect(201);

    const accessToken = loginResponse.body.accessToken as string;
    expect(accessToken).toBeTruthy();

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.displayName).toBe('guilherme');
      });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
      .expect({ success: true });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
