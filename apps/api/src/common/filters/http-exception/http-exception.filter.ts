import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorDetails {
  code: string;
  message: string | string[];
}

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

function isErrorMessage(value: unknown): value is string | string[] {
  if (typeof value === 'string') {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item: unknown) => typeof item === 'string');
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorDetails = this.getErrorDetails(exception, statusCode);

    if (!(exception instanceof HttpException)) {
      const errorStack =
        exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`Unhandled exception`, errorStack);
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      code: errorDetails.code,
      message: errorDetails.message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorDetails(
    exception: unknown,
    statusCode: number,
  ): ErrorDetails {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
      };
    }

    const exceptionResponse = exception.getResponse();
    const defaultCode = this.getDefaultCode(statusCode);

    if (typeof exceptionResponse === 'string') {
      return {
        code: defaultCode,
        message: exceptionResponse,
      };
    }

    const responseMessage =
      'message' in exceptionResponse
        ? exceptionResponse.message
        : exception.message;

    const responseCode =
      'code' in exceptionResponse ? exceptionResponse.code : undefined;

    return {
      code: typeof responseCode === 'string' ? responseCode : defaultCode,
      message: isErrorMessage(responseMessage)
        ? responseMessage
        : exception.message,
    };
  }

  private getDefaultCode(statusCode: number): string {
    const code = HttpStatus[statusCode];

    return typeof code === 'string' ? code : 'HTTP_ERROR';
  }
}
