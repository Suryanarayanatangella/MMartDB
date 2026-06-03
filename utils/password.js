import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
