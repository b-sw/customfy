import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/core/decorators/is-public';

@Public()
@Controller('health')
@ApiTags('Health')
export class HealthController {
  @Get()
  public check(): { status: string } {
    return { status: 'ok' };
  }
}
