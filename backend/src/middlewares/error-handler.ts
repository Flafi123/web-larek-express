import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err.name === 'CelebrateError' || err.joi || (err.details && typeof err.details.get === 'function')) {
    let errorMessage = 'Ошибка валидации входящих данных';

    if (err.details && typeof err.details.get === 'function') {
      const errorDetails = err.details.get('body') || err.details.get('params') || err.details.get('headers');
      if (errorDetails) {
        errorMessage = errorDetails.message;
      }
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
