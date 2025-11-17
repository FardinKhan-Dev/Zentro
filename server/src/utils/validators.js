import validator from 'validator';

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const validatePhoneNumber = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};

export const sanitizeInput = (input) => {
  return validator.trim(validator.escape(String(input)));
};

export const validatePagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  sanitizeInput,
  validatePagination,
};
