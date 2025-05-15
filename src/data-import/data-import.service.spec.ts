import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { DataImportService } from './data-import.service';
import { MetricsService } from '../modules/metrics/metrics.service';
import { PlantsService } from '../modules/plants/plants.service';
import { InvertersService } from '../modules/inverters/inverters.service';

describe('DataImportService', () => {
  let service: DataImportService;
  let mockMetricsService: Partial<MetricsService>;
  let mockPlantsService: Partial<PlantsService>;
  let mockInvertersService: Partial<InvertersService>;

  beforeEach(async () => {
    mockMetricsService = {
      createMany: jest.fn(),
    };

    mockPlantsService = {
      create: jest.fn(),
    };

    mockInvertersService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataImportService,
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
        {
          provide: PlantsService,
          useValue: mockPlantsService,
        },
        {
          provide: InvertersService,
          useValue: mockInvertersService,
        },
      ],
    }).compile();

    service = module.get<DataImportService>(DataImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para o método importMetricsFromJson
  describe('importMetricsFromJson', () => {
    it('deve importar métricas a partir de um JSON válido', async () => {
      const jsonContent = JSON.stringify([
        { timestamp: '2023-01-01T00:00:00Z', inverterId: 1, power: 100, temperature: 25 },
        { timestamp: '2023-01-01T01:00:00Z', inverterId: 1, power: 110, temperature: 26 },
      ]);
      // Simula a criação das métricas
      (mockMetricsService.createMany as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await service.importMetricsFromJson(jsonContent);
      expect(result).toEqual({ imported: 2 });
      expect(mockMetricsService.createMany).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para JSON inválido', async () => {
      await expect(service.importMetricsFromJson('json inválido')).rejects.toThrow(BadRequestException);
      await expect(service.importMetricsFromJson('json inválido')).rejects.toThrow('JSON inválido');
    });

    it('deve lançar BadRequestException se o JSON não for um array', async () => {
      await expect(service.importMetricsFromJson('{}')).rejects.toThrow(BadRequestException);
      await expect(service.importMetricsFromJson('{}')).rejects.toThrow('O conteúdo JSON deve ser um array de métricas');
    });
  });

  // Teste para o método importSampleMetrics
  describe('importSampleMetrics', () => {
    it('deve criar usinas, inversores e importar métricas de exemplo', async () => {
      // Simula a criação de usinas
      (mockPlantsService.create as jest.Mock)
        .mockResolvedValueOnce({ id: 1, name: 'Usina Solar 1' })
        .mockResolvedValueOnce({ id: 2, name: 'Usina Solar 2' });

      // Simula a criação de 8 inversores
      (mockInvertersService.create as jest.Mock).mockImplementation((dto) =>
        Promise.resolve({ id: dto.plantId === 1 ? dto.name.split(' ')[1] : dto.name.split(' ')[1] })
      );

      // Simula a criação de métricas (24 horas para 8 inversores = 192 métricas)
      (mockMetricsService.createMany as jest.Mock).mockResolvedValue(new Array(192).fill({}));

      const result = await service.importSampleMetrics();
      expect(result).toEqual({ imported: 192, plants: 2, inverters: 8 });
      expect(mockPlantsService.create).toHaveBeenCalledTimes(2);
      expect(mockInvertersService.create).toHaveBeenCalledTimes(8);
      expect(mockMetricsService.createMany).toHaveBeenCalled();
    });
  });
}); 