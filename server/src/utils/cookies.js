import jwt from 'jsonwebtoken';

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

export const sendJwtCookie = (res, token, options = {}) => {
  const defaultOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: parseDuration(process.env.JWT_COOKIE_EXPIRE || '7d'),
    path: '/',
  };

  const cookieOpts = { ...defaultOpts, ...options };
  res.cookie('jwt', token, cookieOpts);
};

export const clearJwtCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 0,
    path: '/',
  });
};

function parseDuration(str) {
  // Accept formats like '7d', '24h', or numbers (ms)
  if (!str) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  if (typeof str === 'number') return str;
  const match = /^([0-9]+)(d|h|m|s)$/.exec(String(str));
  if (!match) return parseInt(str, 10) || 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return value;
  }
}

export default { signToken, sendJwtCookie, clearJwtCookie };
