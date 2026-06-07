import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthMethod } from '../enum/auth-method.enum';

export class UserNormalized {
  public id: string;
  public email?: string;
  public authMethod: AuthMethod;
  public avatarUrl: string;
  public displayName: string;
  public isAdmin: boolean;
}

export class UserSerialized {
  @ApiProperty()
  public id: string;

  @ApiPropertyOptional()
  public email?: string;

  @ApiProperty({ enum: AuthMethod })
  public authMethod: AuthMethod;

  @ApiProperty()
  public avatarUrl: string;

  @ApiProperty()
  public displayName: string;

  @ApiProperty()
  public isAdmin: boolean;
}
