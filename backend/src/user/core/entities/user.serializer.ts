import { UserEntity } from './user.entity';
import { UserNormalized, UserSerialized } from './user.interface';

export interface UserSerializerParams {
  showEmailAddress?: boolean;
}

export class UserSerializer {
  public static normalize(entity: UserEntity): UserNormalized {
    return {
      id: entity._id.toString(),
      email: entity.email,
      authMethod: entity.authMethod,
      avatarUrl: entity.avatarUrl,
      displayName: entity.displayName,
      isAdmin: entity.isAdmin ?? false,
    };
  }

  public static serialize(
    normalized: UserNormalized,
    params?: UserSerializerParams,
  ): UserSerialized {
    const result: UserSerialized = {
      id: normalized.id,
      authMethod: normalized.authMethod,
      avatarUrl: normalized.avatarUrl,
      displayName: normalized.displayName,
      isAdmin: normalized.isAdmin ?? false,
    };

    if (params?.showEmailAddress) {
      result.email = normalized.email;
    }

    return result;
  }
}
