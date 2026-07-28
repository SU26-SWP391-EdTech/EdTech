import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LoginLockService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Check if user account is currently locked.
   * Throws UnauthorizedException if account lock is still active.
   */
  checkLock(user: User): void {
    if (user.lockedUntil) {
      const now = new Date();
      const lockExpiry = new Date(user.lockedUntil);
      if (lockExpiry > now) {
        const remainingMs = lockExpiry.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        throw new UnauthorizedException(
          `Account is locked due to 3 failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        );
      }
    }
  }

  /**
   * Handle a failed login attempt.
   * Increments failedAttempts count. If it reaches 3 or more, sets lockedUntil to 5 minutes from now.
   */
  async handleFailedAttempt(user: User): Promise<void> {
    const currentAttempts = (user.failedAttempts || 0) + 1;
    user.failedAttempts = currentAttempts;

    if (currentAttempts >= 3) {
      const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await this.userRepository.save(user);
  }

  /**
   * Handle a successful login attempt.
   * Resets failedAttempts to 0 and clears lockedUntil.
   */
  async handleSuccessAttempt(user: User): Promise<void> {
    if (user.failedAttempts > 0 || user.lockedUntil) {
      user.failedAttempts = 0;
      user.lockedUntil = null as any;
      await this.userRepository.save(user);
    }
  }
}
