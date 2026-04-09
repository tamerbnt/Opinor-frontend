import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (isProduction && !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }

  return {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  };
});
