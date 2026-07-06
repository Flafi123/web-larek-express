import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';

import productRouter from './routes/product';
import orderRouter from './routes/order';

import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

const app = express();

app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.send('Сервер успешно запущен!');
});

app.use('/product', productRouter);
app.use('/order', orderRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError('Запрашиваемый маршрут не найден'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

mongoose.set('strictQuery', true);
mongoose.connect(DB_ADDRESS)
  .then(() => {
    // console.log(`Успешное подключение к MongoDB по адресу: ${DB_ADDRESS}`);

    app.listen(PORT, () => {
      // console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
    });
  })
  .catch((_error) => {
    // console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  });
