import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { Metric } from './entities/metric.entity';
import { Inverter } from '../inverters/entities/inverter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Metric, Inverter])],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {} 