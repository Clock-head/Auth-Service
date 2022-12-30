import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  if (!process.env.TICKETING_KEY) {
    throw new Error('JWT Key must be defined.');
  }

  if (!process.env.EMAIL_KEY) {
    throw new Error('Email key must be defined.');
  }

  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('connected to mongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('app listening on 3000');
  });
};

start();
