import { IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ description: 'Data de início (formato ISO)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'Data de fim (formato ISO)' })
  @IsDateString()
  endDate!: string;
}

export class InverterDateRangeDto extends DateRangeDto {
  @ApiProperty({ description: 'ID do inversor' })
  @IsNumber()
  inverterId!: number;
}

export class PlantDateRangeDto extends DateRangeDto {
  @ApiProperty({ description: 'ID da usina' })
  @IsNumber()
  plantId!: number;
} 