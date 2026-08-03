import { validateEnv } from './env.validation';

const appConfig = () => {
  const env = validateEnv(process.env);

  return {
    server: {
      nodeEnv: env.NODE_ENV,
      port: env.API_PORT,
      frontendUrl: env.FRONTEND_URL,
    },

    database: {
      postgresUrl: env.DATABASE_URL,
    },

    redis: {
      url: env.REDIS_URL,
    },

    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },

    mail: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
    },

    jobs: {
      noShowGraceMinutes: env.NO_SHOW_GRACE_MINUTES,
    },
  };
};

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
