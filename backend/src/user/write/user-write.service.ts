import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthMethod } from '../core/enum/auth-method.enum';
import { UserEntity } from '../core/entities/user.entity';
import { UserNormalized } from '../core/entities/user.interface';
import { UserSerializer } from '../core/entities/user.serializer';
import { CreateUserDto } from './dto/create-user.dto';

const ADJECTIVES = [
  'happy',
  'cheerful',
  'excited',
  'playful',
  'curious',
  'energetic',
  'friendly',
  'jolly',
  'bright',
  'swift',
];

const ANIMALS = [
  'koala',
  'kangaroo',
  'capybara',
  'penguin',
  'otter',
  'panda',
  'dolphin',
  'raccoon',
  'sloth',
  'hedgehog',
];

@Injectable()
export class UserWriteService {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
  ) {}

  private generateRandomDisplayName(): string {
    const randomAdjective =
      ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return `${randomAdjective} ${randomAnimal}`;
  }

  public async create(dto: CreateUserDto): Promise<UserNormalized> {
    const user = await this.userModel.create({
      email: dto.email,
      authMethod: dto.authMethod,
      avatarUrl: dto.avatarUrl,
      displayName: dto.displayName || this.generateRandomDisplayName(),
      isAdmin: dto.authMethod === AuthMethod.Local,
    });

    return UserSerializer.normalize(user);
  }

  public async deleteById(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }
}
