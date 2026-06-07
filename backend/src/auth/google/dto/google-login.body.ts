import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GoogleLoginBody {
  @ApiProperty()
  @IsString()
  googleCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  forceLocalLogin?: boolean;
}
