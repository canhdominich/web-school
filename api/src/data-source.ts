import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

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
