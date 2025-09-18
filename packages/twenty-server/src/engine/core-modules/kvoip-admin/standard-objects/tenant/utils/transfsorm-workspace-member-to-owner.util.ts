import { User } from 'src/engine/core-modules/user/user.entity';

export const transformDatabaseUserToOwner = (user: User) => ({
  name: {
    firstName: user.firstName,
    lasName: user.lastName,
  },
  avatarUrl: user.defaultAvatarUrl,
  userId: user.id,
});
