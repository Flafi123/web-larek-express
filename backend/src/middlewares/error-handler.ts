import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isCelebrateError(err)) {
    let errorMessage = 'Ошибка валидации входящих данных';

    const joiError = err.details.get('body') || err.details.get('params') || err.details.get('headers');
    
    if (joiError && joiError.details && joiError.details.length > 0) {
      errorMessage = joiError.details[0].message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    return res.status(400).json({ message: errorMessage });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'На сервере произошла внутренняя ошибка'
    : err.message;

  return res.status(statusCode).json({ message });
};

export default errorHandler;