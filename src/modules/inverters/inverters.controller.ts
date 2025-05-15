import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvertersService } from './inverters.service';
import { CreateInverterDto } from './dto/create-inverter.dto';
import { UpdateInverterDto } from './dto/update-inverter.dto';
import { InverterDateRangeDto } from '../metrics/dto/date-range.dto';
import { DateParserDto } from './dto/date-parser.dto';

@ApiTags('inversores')
@Controller('inverters')
export class InvertersController {
  constructor(private readonly invertersService: InvertersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo inversor' })
  @ApiResponse({ status: 201, description: 'Inversor criado com sucesso' })
  async create(@Body() createInverterDto: CreateInverterDto) {
    try {
      return await this.invertersService.create(createInverterDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os inversores' })
  async findAll() {
    try {
      return await this.invertersService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/avg-temperature')
  @ApiOperation({ summary: 'Obter a temperatura média por dia para um inversor' })
  async getAvgTemperaturePerDay(
    @Param('id', ParseIntPipe) id: number, 
    @Query() generationDto: DateParserDto
  ) {
    try {
      return await this.invertersService.getAvgTemperaturePerDay(
        id,
        generationDto.startDate,
        generationDto.endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/generation')
  @ApiOperation({ summary: 'Calcular a geração total do inversor em um período' })
  async calculateGeneration(
    @Param('id', ParseIntPipe) id: number, 
    @Query() generationDto: DateParserDto
  ) {
    try {
      return await this.invertersService.calculateGeneration(
        id,
        generationDto.startDate,
        generationDto.endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/max-power')
  @ApiOperation({ summary: 'Obter a potência máxima por dia para um inversor' })
  async getMaxPowerPerDay(
    @Param('id', ParseIntPipe) id: number, 
    @Query() dateRange: InverterDateRangeDto,
  ) {
    try {
      return await this.invertersService.getMaxPowerPerDay(
        id,
        dateRange.startDate,
        dateRange.endDate,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um inversor pelo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.invertersService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um inversor' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateInverterDto: UpdateInverterDto
  ) {
    try {
      return await this.invertersService.update(id, updateInverterDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um inversor' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.invertersService.remove(id);
    } catch (error) {
      throw error;
    }
  }
} 