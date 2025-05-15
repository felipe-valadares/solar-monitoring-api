import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PlantsService {
  constructor(
    @InjectRepository(Plant)
    private plantsRepository: Repository<Plant>,
    private metricsService: MetricsService,
  ) {}

  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    try {
      const plant = this.plantsRepository.create(createPlantDto);
      return await this.plantsRepository.save(plant);
    } catch (error) {
      // Você pode registrar o erro aqui, se desejar
      throw error;
    }
  }

  async findAll(): Promise<Plant[]> {
    try {
      return await this.plantsRepository.find({ relations: ['inverters'] });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Plant> {
    try {
      const plant = await this.plantsRepository.findOne({
        where: { id },
        relations: ['inverters'],
      });

      if (!plant) {
        throw new NotFoundException(`Usina com ID ${id} não encontrada`);
      }

      return plant;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    try {
      const plant = await this.findOne(id);
      this.plantsRepository.merge(plant, updatePlantDto);
      return await this.plantsRepository.save(plant);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const plant = await this.findOne(id);
      await this.plantsRepository.remove(plant);
    } catch (error) {
      throw error;
    }
  }

  async calculateGeneration(
    plantId: number,
    startDate: string,
    endDate: string,
  ): Promise<{ totalGeneration: number }> {
    try {
      const plant = await this.findOne(plantId);
      const inverterIds = plant.inverters.map((inverter) => inverter.id);
      const totalGeneration = await this.metricsService.calculateTotalGeneration(
        inverterIds,
        startDate,
        endDate,
      );
      return { totalGeneration };
    } catch (error) {
      throw error;
    }
  }
} 