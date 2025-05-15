import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DataImportService } from './data-import.service';

@ApiTags('importação')
@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('metrics')
  @ApiOperation({ summary: 'Importar métricas de um arquivo JSON' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importMetrics(@UploadedFile() file: Express.Multer.File) {
    try {
      return await this.dataImportService.importMetricsFromJson(file.buffer.toString());
    } catch (error) {
      throw error;
    }
  }

  @Post('metrics/sample')
  @ApiOperation({ summary: 'Importar métricas de amostra' })
  async importSampleMetrics() {
    try {
      return await this.dataImportService.importSampleMetrics();
    } catch (error) {
      throw error;
    }
  }
} 