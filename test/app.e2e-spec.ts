import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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
    return request(app.getHttpServer()).get('/').expect(404);
  });

  it('auth flow should signup, signin, refresh and logout', async () => {
    const unique = Date.now();

    const inviteResponse = await request(app.getHttpServer())
      .post('/auth/invite-codes')
      .send({})
      .expect(201);

    const inviteCode = inviteResponse.body.code as string;
    expect(inviteCode).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `guilherme+${unique}@example.com`,
        username: `guilherme${unique}`,
        password: 'testpassword',
        inviteCode,
      })
      .expect(201);

    const signinResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ password: 'testpassword', username: `guilherme${unique}` })
      .expect(201);

    const refreshCookie = signinResponse.headers['set-cookie']?.[0] as
      | string
      | undefined;
    expect(refreshCookie).toBeDefined();

    const accessToken = signinResponse.body.accessToken as string;
    expect(accessToken).toBeTruthy();

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.username).toBe(`guilherme${unique}`);
      });

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie as string)
      .expect(201);

    const rotatedCookie = refreshResponse.headers['set-cookie']?.[0] as
      | string
      | undefined;
    expect(rotatedCookie).toBeDefined();

    const refreshedAccessToken = refreshResponse.body.accessToken as string;
    expect(refreshedAccessToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshedAccessToken}`)
      .expect(201)
      .expect({ success: true });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', rotatedCookie as string)
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
