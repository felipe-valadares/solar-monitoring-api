import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateParserDto {
  @ApiProperty({
    description: 'Data de início do período',
    example: '2025-05-14T01:24:43.230Z',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Data de término do período',
    example: '2025-05-14T23:24:43.230Z',
  })
  @IsDateString()
  endDate!: string;
}