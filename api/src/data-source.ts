import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export const createDataSource = async (configService: ConfigService) => {
  const dbConfig: DataSourceOptions = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    type: configService.get<string>('DB_TYPE') as any,
    host: configService.get<string>('DB_HOST'),
    port: +configService.get<number>('DB_PORT')!,
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    synchronize: configService.get('APP_ENV') === 'development',
    logging: configService.get<boolean>('DB_LOGGING'),
    entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  };

  console.log('Database config:', dbConfig);
  return dbConfig;
};

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any || 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.APP_ENV === 'development',
  logging: process.env.DB_LOGGING === 'false',
  entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});

