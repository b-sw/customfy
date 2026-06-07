import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayloadDto } from '../../custom-jwt/dto/jwt-payload.dto';
import { CustomJwtService } from '../../custom-jwt/custom-jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/is-public';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: CustomJwtService,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayloadDto }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.getTokenPayload(token);

    if (!payload) {
      throw new UnauthorizedException();
    }

    request.user = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
