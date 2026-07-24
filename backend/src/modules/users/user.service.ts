import { userRepository } from './user.repository';
import { UpdateProfileInput, UserProfile } from './user.types';

export class UserService {
  async getProfile(userId: string): Promise<UserProfile> {
    return userRepository.findById(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<UserProfile> {
    return userRepository.updateProfile(userId, data);
  }
}

export const userService = new UserService();
