import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

const NODE_ENVIRONMENTS = ['development', 'production', 'test'] as const;

const BOOLEAN_STRINGS = ['true', 'false'] as const;

type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];
type BooleanString = (typeof BOOLEAN_STRINGS)[number];
type JwtDuration = `${number}${'s' | 'm' | 'h' | 'd'}`;

export class EnvironmentVariables {
  @IsIn(NODE_ENVIRONMENTS)
  NODE_ENV!: NodeEnvironment;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65_535)
  API_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsString()
  @Matches(/^[1-9]\d*[smhd]$/, {
    message: 'JWT_EXPIRES_IN must use formats such as 30m, 8h or 1d',
  })
  JWT_EXPIRES_IN!: JwtDuration;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  NO_SHOW_GRACE_MINUTES!: number;

  @IsString()
  SMTP_HOST!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65_535)
  SMTP_PORT!: number;

  @IsIn(BOOLEAN_STRINGS)
  SMTP_SECURE!: BooleanString;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_PASSWORD!: string;

  @IsString()
  SMTP_FROM!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedEnvironment = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedEnvironment, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}).map(
        (message) => `${error.property}: ${message}`,
      ),
    );

    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  return validatedEnvironment;
}
