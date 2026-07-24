import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../core/security/password';
import { generateToken, JwtPayload } from '../../core/security/jwt';
import { UnauthorizedError } from '../../core/errors/AppError';
import { RegisterInput, LoginInput, AuthResponse, AuthUser } from './auth.types';
import { AUTH_ERRORS } from './auth.constants';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const passwordHash = await hashPassword(data.password);
    const user = await authRepository.create(data, passwordHash);

    const token = this.generateToken(user);

    return {
      user,
      accessToken: token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };

    const token = this.generateToken(authUser);

    return {
      user: authUser,
      accessToken: token,
    };
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  }

  private generateToken(user: AuthUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return generateToken(payload);
  }
}

export const authService = new AuthService();
