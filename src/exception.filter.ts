import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

interface DefaultError {
  statusCode: number;
  message: string;
}

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
}

export interface CustomError extends Error {
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const defaultError: DefaultError = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unknown error occurred',
    };

    // Extract the response object if it's an HttpException
    let originalError = exception;
    if (exception instanceof HttpException) {
      originalError = exception.getResponse();
      defaultError.statusCode = exception.getStatus();
      defaultError.message = exception.message;
    }

    // If the original error is a string or an object containing a MongoError
    if (typeof originalError === 'string') {
      defaultError.message = originalError;
    } else if (originalError instanceof Error) {
      defaultError.message = originalError.message;

      // Check if it's a validation error from Mongoose
      if (originalError instanceof MongooseError.ValidationError) {
        defaultError.statusCode = HttpStatus.BAD_REQUEST;
        defaultError.message = Object.values(originalError.errors)
          .map((item) => item.message)
          .join(', ');
      }
    }

    // Check if the exception is a MongoError or wrapped within an object
    const exceptionObject = originalError as any;
    if (
      typeof exceptionObject === 'object' &&
      'code' in exceptionObject &&
      exceptionObject.code === 11000
    ) {
      defaultError.statusCode = HttpStatus.BAD_REQUEST;
      const key = Object.keys(exceptionObject.keyValue || {})[0];
      defaultError.message = `${key.charAt(0).toUpperCase() + key.slice(1)} already exists.`;
    }

    response.status(defaultError.statusCode).json({
      message: defaultError.message,
      statusCode: defaultError.statusCode,
      success: false,
    });
  }
}
