import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'investment_platform',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    logger: 'advanced-console',
    maxQueryExecutionTime: 1000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    statement_timeout: 30000,
  }),
);
