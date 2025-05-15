import { IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricDto {
  @ApiProperty({ description: 'Timestamp da medição' })
  @IsDateString()
  timestamp!: string;

  @ApiProperty({ description: 'Potência ativa em Watts', required: false })
  @IsNumber()
  @IsOptional()
  power?: number;

  @ApiProperty({ description: 'Temperatura em graus Celsius', required: false })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiProperty({ description: 'ID do inversor associado à medição' })
  @IsNumber()
  inverterId!: number;
} 