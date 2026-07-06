import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;

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
};

export default createOrder;
