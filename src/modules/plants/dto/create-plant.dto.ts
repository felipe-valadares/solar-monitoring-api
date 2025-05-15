import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({ description: 'Nome da usina fotovoltaica' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Localização da usina', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Capacidade instalada em kW', required: false })
  @IsNumber()
  @IsOptional()
  capacity?: number;
} 