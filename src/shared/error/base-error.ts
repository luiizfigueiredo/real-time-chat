import { HttpException } from '@nestjs/common';

interface BaseErrorParams {
  code: string;
  message: string;
  status: number;
}

export class BaseError extends HttpException {
  code: string;

  constructor({ code, message, status }: BaseErrorParams) {
    super(
      {
        statusCode: status,
        message: message,
        error: code,
      },
      status,
    );
    this.code = code;
  }
}
