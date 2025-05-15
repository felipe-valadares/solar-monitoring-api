import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PlantDateRangeDto } from '../metrics/dto/date-range.dto';

@ApiTags('usinas')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova usina' })
  @ApiResponse({ status: 201, description: 'Usina criada com sucesso' })
  async create(@Body() createPlantDto: CreatePlantDto) {
    try {
      return await this.plantsService.create(createPlantDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as usinas' })
  async findAll() {
    try {
      return await this.plantsService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma usina pelo ID' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.plantsService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma usina' })
  async update(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    try {
      return await this.plantsService.update(+id, updatePlantDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma usina' })
  async remove(@Param('id') id: string) {
    try {
      return await this.plantsService.remove(+id);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/generation')
  @ApiOperation({ summary: 'Calcular a geração total da usina em um período' })
  async calculateGeneration(@Param('id') id: string, @Query() dateRange: PlantDateRangeDto) {
    try {
      return await this.plantsService.calculateGeneration(+id, dateRange.startDate, dateRange.endDate);
    } catch (error) {
      throw error;
    }
  }
} 