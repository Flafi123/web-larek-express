import {
  Router, Request, Response, NextFunction,
} from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const router = Router();

// Регулярное выражение для базовой проверки email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!payment || !['card', 'online'].includes(payment)) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа: поле payment должно быть "card" или "online"'));
    }
    if (!email || !emailRegex.test(email)) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа: передан некорректный формат email'));
    }
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа: поле phone обязательно для заполнения'));
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа: поле address обязательно для заполнения'));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа: массив items не должен быть пустым'));
    }

    const dbProducts = await Product.find({ _id: { $in: items } });

    if (dbProducts.length !== new Set(items).size) {
      return next(new BadRequestError('Один или несколько товаров не найдены в базе данных'));
    }

    let calculatedTotal = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const product of dbProducts) {
      if (product.price === null) {
        return next(new BadRequestError(`Товар "${product.title}" не продается`));
      }

      const countInOrder = items.filter((id) => id === product._id.toString()).length;
      calculatedTotal += product.price * countInOrder;
    }

    if (typeof total !== 'number' || total !== calculatedTotal) {
      return next(new BadRequestError(`Сумма total (${total}) не совпадает с расчетной стоимостью товаров (${calculatedTotal})`));
    }

    return res.status(201).json({
      id: faker.string.uuid(),
      total,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
