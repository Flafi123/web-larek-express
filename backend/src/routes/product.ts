import {
  Router, Request, Response, NextFunction,
} from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    const totalCount = await Product.countDocuments({});

    res.status(200).json({
      items: products,
      total: totalCount,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const newProduct = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });

    return res.status(201).json(newProduct);
  } catch (error: unknown) {
    // console.error('Ошибка при создании товара:', error);

    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }

    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(`Ошибка валидации данных при создании товара: ${error.message}`));
    }

    return next(error);
  }
});

export default router;
