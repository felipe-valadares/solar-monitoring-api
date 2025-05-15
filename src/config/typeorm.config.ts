import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Plant } from '../modules/plants/entities/plant.entity';
import { Inverter } from '../modules/inverters/entities/inverter.entity';
import { Metric } from '../modules/metrics/entities/metric.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_NAME', 'solar_monitoring'),
  entities: [Plant, Inverter, Metric],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
}); 