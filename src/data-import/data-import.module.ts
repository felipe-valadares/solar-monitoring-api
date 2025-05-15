import { Module } from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { DataImportController } from './data-import.controller';
import { MetricsModule } from '../modules/metrics/metrics.module';
import { PlantsModule } from '../modules/plants/plants.module';
import { InvertersModule } from '../modules/inverters/inverters.module';

@Module({
  imports: [
    MetricsModule,
    PlantsModule,
    InvertersModule,
  ],
  controllers: [DataImportController],
  providers: [DataImportService],
})
export class DataImportModule {} 