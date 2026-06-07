import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayloadDto } from '../../custom-jwt/dto/jwt-payload.dto';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayloadDto }>();

    return request.user?.id;
  },
);
