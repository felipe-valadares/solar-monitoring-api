import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInverterDto {
  @ApiProperty({ description: 'Nome do inversor' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Modelo do inversor', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ description: 'Número de série do inversor', required: false })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiProperty({ description: 'ID da usina à qual o inversor pertence' })
  @IsNumber()
  plantId!: number;
} 