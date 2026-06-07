import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { Public } from '../../auth/core/decorators/is-public';
import { UserReadService } from '../read/user-read.service';
import { UserSerialized } from './entities/user.interface';
import { UserSerializer } from './entities/user.serializer';

@Controller('users')
@ApiTags('Users')
export class UserCoreController {
  constructor(private readonly userReadService: UserReadService) {}

  @Public()
  @Get('count')
  @ApiResponse({ schema: { properties: { count: { type: 'number' } } } })
  public async countUsers(): Promise<{ count: number }> {
    const count = await this.userReadService.countAll();

    return { count };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ type: UserSerialized })
  public async readCurrentUser(
    @CurrentUserId() userId: string,
  ): Promise<UserSerialized> {
    const user = await this.userReadService.readByIdOrThrow(userId);

    return UserSerializer.serialize(user, { showEmailAddress: true });
  }
}
