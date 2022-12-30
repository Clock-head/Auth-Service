import request from 'supertest';
import { app } from '../../app';

it('fails when an email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await signup();

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password0',
    })
    .expect(400);
});

it('responds with 4-digit code when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const code = await signin();

  expect(typeof code).toBe('number');
  expect(code.toString()).toHaveLength(4);
});
