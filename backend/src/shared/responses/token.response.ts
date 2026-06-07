import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty()
  token: string;

  @ApiPropertyOptional()
  isNewUser?: boolean;
}
