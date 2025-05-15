import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inverter } from './entities/inverter.entity';
import { CreateInverterDto } from './dto/create-inverter.dto';
import { UpdateInverterDto } from './dto/update-inverter.dto';
import { MetricsService } from '../metrics/metrics.service';
import { PlantsService } from '../plants/plants.service';

@Injectable()
export class InvertersService {
  constructor(
    @InjectRepository(Inverter)
    private invertersRepository: Repository<Inverter>,
    private metricsService: MetricsService,
    private plantsService: PlantsService,
  ) {}

  async create(createInverterDto: CreateInverterDto): Promise<Inverter> {
    try {
      // Supondo que você tenha um método para buscar a usina pelo id
      const plant = await this.plantsService.findOne(createInverterDto.plantId);
      if (!plant) {
        throw new BadRequestException('Plant não encontrada');
      }

      const inverter = this.invertersRepository.create({
        ...createInverterDto,
        plant, // atribuímos a entidade plant à propriedade 'plant'
      });
      return await this.invertersRepository.save(inverter);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Inverter[]> {
    try {
      return await this.invertersRepository.find({ relations: ['plant'] });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Inverter> {
    try {
      const inverter = await this.invertersRepository.findOne({
        where: { id },
        relations: ['plant'],
      });

      if (!inverter) {
        throw new NotFoundException(`Inversor com ID ${id} não encontrado`);
      }

      return inverter;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateInverterDto: UpdateInverterDto,
  ): Promise<Inverter> {
    try {
      const inverter = await this.findOne(id);

      // Se o plantId estiver sendo atualizado, verificar se a usina existe
      if (updateInverterDto.plantId) {
        await this.plantsService.findOne(updateInverterDto.plantId);
      }

      this.invertersRepository.merge(inverter, updateInverterDto);
      return await this.invertersRepository.save(inverter);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const inverter = await this.findOne(id);
      await this.invertersRepository.remove(inverter);
    } catch (error) {
      throw error;
    }
  }

  async getMaxPowerPerDay(
    inverterId: number,
    startDate: string,
    endDate: string,
  ): Promise<Record<string, number>> {
    try {
      await this.findOne(inverterId);
      return await this.metricsService.getMaxPowerPerDay(
        inverterId,
        startDate,
        endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  async getAvgTemperaturePerDay(
    inverterId: number,
    startDate: string,
    endDate: string,
  ): Promise<Record<string, number>> {
    try {
      await this.findOne(inverterId);
      return await this.metricsService.getAvgTemperaturePerDay(
        inverterId,
        startDate,
        endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  async calculateGeneration(
    inverterId: number,
    startDate: string,
    endDate: string,
  ): Promise<{ totalGeneration: number }> {
    try {
      await this.findOne(inverterId);
      const totalGeneration = await this.metricsService.calculateTotalGeneration(
        [inverterId],
        startDate,
        endDate,
      );
      return { totalGeneration };
    } catch (error) {
      throw error;
    }
  }
} 