export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE: {
    URL:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/tiketkuy?schema=public',
  },
  JWT_SECRET: process.env.JWT_SECRET || 'AKUCINTAKAMUJANCUK',
  SALT_ROUNDS: process.env.SALT_ROUNDS || 10,
});
