import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export const requireIsMongoId = (value: string): string => {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException('Id validation fail');
  }
  return value;
};
