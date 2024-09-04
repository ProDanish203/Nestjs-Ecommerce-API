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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      defaultError.statusCode = status;
      defaultError.message = message;
    } else if (exception instanceof Error) {
      defaultError.message = exception.message;
      if (
        'statusCode' in exception &&
        typeof (exception as CustomError).statusCode === 'number'
      ) {
        defaultError.statusCode = (exception as CustomError).statusCode;
      }
    }

    if (exception instanceof MongooseError.ValidationError) {
      defaultError.statusCode = HttpStatus.BAD_REQUEST;
      defaultError.message = Object.values(exception.errors)
        .map((item) => item.message)
        .join(', ');
    }

    if (
      typeof exception === 'object' &&
      'code' in exception &&
      (exception as MongoError).code === 11000
    ) {
      defaultError.statusCode = HttpStatus.BAD_REQUEST;
      const key = Object.keys((exception as MongoError).keyValue || {})[0];
      defaultError.message = `${key.charAt(0).toUpperCase() + key.slice(1)} already exists.`;
    }

    response.status(defaultError.statusCode).json({
      message: defaultError.message,
      statusCode: defaultError.statusCode,
      success: false,
    });
  }
}
