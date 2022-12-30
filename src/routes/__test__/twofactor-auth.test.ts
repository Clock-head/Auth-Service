import request from 'supertest';
import { app } from '../../app';

it('throws a 400 if two factor code has expired.', async () => {
  const email = 'test@test.com';
  const password = 'password';

  await signup();
  // sign up places a cookie in the client browser.

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  //console.log(response.get('Set-Cookie'));
  expect(response.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );

  const code = await signin();

  expect(typeof code).toBe('number');
  expect(code.toString()).toHaveLength(4);

  const date = new Date();
  const expiryDate = date.setMinutes(date.getMinutes() + 6);

  //console.log('expiry', expiryDate);

  await request(app)
    .post('/api/users/twofactorauth')
    .send({
      email,
      password,
      expiryDate,
    })
    .expect(400);
});

it('sets a cookie if code matches.', async () => {
  const email = 'test@test.com';
  //const password = 'password';

  await signup();
  // sign up places a cookie in the client browser.

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  //console.log(response.get('Set-Cookie'));
  expect(response.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );

  const code = await signin();

  expect(typeof code).toBe('number');
  expect(code.toString()).toHaveLength(4);

  const date = new Date();
  const dateInput = date.getTime();

  const secondResponse = await request(app)
    .post('/api/users/twofactorauth')
    .send({
      email,
      code,
      dateInput,
    })
    .expect(200);

  const cookie = secondResponse.get('Set-Cookie');

  expect(cookie).toBeDefined();
});
