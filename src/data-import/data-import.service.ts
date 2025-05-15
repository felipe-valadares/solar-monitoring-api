import { Injectable, BadRequestException } from '@nestjs/common';
import { MetricsService } from '../modules/metrics/metrics.service';
import { PlantsService } from '../modules/plants/plants.service';
import { InvertersService } from '../modules/inverters/inverters.service';
import { CreateMetricDto } from '../modules/metrics/dto/create-metric.dto';
import { CreatePlantDto } from '../modules/plants/dto/create-plant.dto';
import { CreateInverterDto } from '../modules/inverters/dto/create-inverter.dto';
import * as fs from 'fs';
import * as path from 'path';

interface MetricData {
  timestamp: string;
  inverterId: number;
  power?: number;
  temperature?: number;
}

@Injectable()
export class DataImportService {
  constructor(
    private metricsService: MetricsService,
    private plantsService: PlantsService,
    private invertersService: InvertersService,
  ) {}

  async importMetricsFromJson(jsonContent: string): Promise<{ imported: number }> {
    try {
      const data = JSON.parse(jsonContent) as MetricData[];
      
      if (!Array.isArray(data)) {
        throw new BadRequestException('O conteúdo JSON deve ser um array de métricas');
      }

      const metricsToCreate: CreateMetricDto[] = data.map(item => ({
        timestamp: item.timestamp,
        inverterId: item.inverterId,
        power: item.power,
        temperature: item.temperature,
      }));

      const createdMetrics = await this.metricsService.createMany(metricsToCreate);
      
      return { imported: createdMetrics.length };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('JSON inválido');
      }
      throw error;
    }
  }

  async importSampleMetrics(): Promise<{ imported: number; plants: number; inverters: number }> {
    try {
      // Criar usinas de exemplo
      const plant1 = await this.plantsService.create({
        name: 'Usina Solar 1',
        location: 'São Paulo',
        capacity: 1000,
      });

      const plant2 = await this.plantsService.create({
        name: 'Usina Solar 2',
        location: 'Rio de Janeiro',
        capacity: 800,
      });

      // Criar inversores de exemplo
      const inverters = [];
      
      // Inversores para Usina 1
      for (let i = 1; i <= 4; i++) {
        const inverter = await this.invertersService.create({
          name: `Inversor ${i}`,
          model: `Modelo A${i}`,
          serialNumber: `SN00${i}`,
          plantId: plant1.id,
        });
        inverters.push(inverter);
      }
      
      // Inversores para Usina 2
      for (let i = 5; i <= 8; i++) {
        const inverter = await this.invertersService.create({
          name: `Inversor ${i}`,
          model: `Modelo B${i}`,
          serialNumber: `SN00${i}`,
          plantId: plant2.id,
        });
        inverters.push(inverter);
      }

      // Gerar dados de exemplo para métricas
      const metricsToCreate: CreateMetricDto[] = [];
      const now = new Date();
      
      // Iterar pelos inversores criados para gerar métricas com seus IDs reais
      for (const inverter of inverters) {
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now);
          timestamp.setHours(hour);
          
          // Simular curva de potência solar (maior durante o dia)
          let power = 0;
          if (hour >= 6 && hour <= 18) {
            const peakHour = 12;
            const hourDiff = Math.abs(hour - peakHour);
            // Utiliza inverter.plantId para comparar com plant1.id
            const maxPower = inverter.plant?.id === plant1.id ? 250 : 200;
            power = maxPower * (1 - (hourDiff / 6) ** 2);
          }
          
          // Simular temperatura (variação ao longo do dia)
          let temperature = 25;
          if (hour >= 6 && hour <= 18) {
            const peakHour = 14;
            const hourDiff = Math.abs(hour - peakHour);
            temperature = 25 + 15 * (1 - (hourDiff / 8) ** 2);
          }
          
          metricsToCreate.push({
            timestamp: timestamp.toISOString(),
            inverterId: inverter.id,
            power,
            temperature,
          });
        }
      }
      
      const createdMetrics = await this.metricsService.createMany(metricsToCreate);
      
      return { 
        imported: createdMetrics.length,
        plants: 2,
        inverters: 8,
      };
    } catch (error) {
      throw error;
    }
  }
} 