import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Metric } from './entities/metric.entity';
import { CreateMetricDto } from './dto/create-metric.dto';
import { calculateMaxPowerPerDay, calculateAvgTemperaturePerDay, calcInvertersGeneration } from '../../common/utils/calculation.utils';
import { Inverter } from '../inverters/entities/inverter.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private metricsRepository: Repository<Metric>,
    @InjectRepository(Inverter)
    private invertersRepository: Repository<Inverter>,
  ) {}

  async create(createMetricDto: CreateMetricDto): Promise<Metric> {
    try {
      const inverter = await this.invertersRepository.findOne({ where: { id: createMetricDto.inverterId } });
      if (!inverter) {
        throw new NotFoundException(`Inversor com id ${createMetricDto.inverterId} não encontrado`);
      }

      const metric = this.metricsRepository.create({
        timestamp: new Date(createMetricDto.timestamp),
        power: createMetricDto.power,
        temperature: createMetricDto.temperature,
        inverter,
      });
      return await this.metricsRepository.save(metric);
    } catch (error) {
      throw error;
    }
  }

  async createMany(createMetricDtos: CreateMetricDto[]): Promise<Metric[]> {
    try {
      const metrics = [];

      for (const dto of createMetricDtos) {
        const inverter = await this.invertersRepository.findOne({ where: { id: dto.inverterId } });
        if (!inverter) {
          throw new NotFoundException(`Inversor com id ${dto.inverterId} não encontrado`);
        }

        const metric = this.metricsRepository.create({
          timestamp: new Date(dto.timestamp),
          power: dto.power,
          temperature: dto.temperature,
          inverter,
        });
        metrics.push(metric);
      }

      return await this.metricsRepository.save(metrics);
    } catch (error) {
      throw error;
    }
  }

  async getMaxPowerPerDay(inverterId: number, startDate: string, endDate: string): Promise<Record<string, number>> {
    try {
      const metrics = await this.metricsRepository.find({
        where: {
          inverter: { id: inverterId },
          timestamp: Between(new Date(startDate), new Date(endDate)),
          power: Not(IsNull()),
        },
        order: {
          timestamp: 'ASC',
        },
      });

      const powerData = metrics.map(metric => ({
        value: metric.power,
        date: metric.timestamp,
      }));

      return calculateMaxPowerPerDay(powerData);
    } catch (error) {
      throw error;
    }
  }

  async getAvgTemperaturePerDay(inverterId: number, startDate: string, endDate: string): Promise<Record<string, number>> {
    try {
      const metrics = await this.metricsRepository.find({
        where: {
          inverter: { id: inverterId },
          timestamp: Between(new Date(startDate), new Date(endDate)),
          temperature: Not(IsNull()),
        },
        order: {
          timestamp: 'ASC',
        },
      });

      const temperatureData = metrics.map(metric => ({
        value: metric.temperature,
        date: metric.timestamp,
      }));

      if (temperatureData.length === 0) {
        return {};
      }

      const result = calculateAvgTemperaturePerDay(temperatureData);
      return result;
    } catch (error) {
      console.error('Erro no getAvgTemperaturePerDay:', error);
      throw error;
    }
  }

  async calculateTotalGeneration(inverterIds: number[], startDate: string, endDate: string): Promise<number> {
    try {
      const entitiesWithPower = [];

      for (const inverterId of inverterIds) {
        const metrics = await this.metricsRepository.find({
          where: {
            inverter: { id: inverterId },
            timestamp: Between(new Date(startDate), new Date(endDate)),
            power: Not(IsNull()),
          },
          order: {
            timestamp: 'ASC',
          },
        });

        if (metrics.length > 0) {
          const powerData = metrics.map(metric => ({
            value: metric.power,
            date: metric.timestamp,
          }));

          entitiesWithPower.push({ power: powerData });
        }
      }

      return calcInvertersGeneration(entitiesWithPower);
    } catch (error) {
      throw error;
    }
  }
}