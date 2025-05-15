import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import * as calcUtils from '../../common/utils/calculation.utils';

import { MetricsService } from './metrics.service';
import { Metric } from './entities/metric.entity';
import { Inverter } from '../inverters/entities/inverter.entity';

describe('MetricsService', () => {
  let service: MetricsService;
  let metricsRepository: Repository<Metric>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(Metric),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    metricsRepository = module.get<Repository<Metric>>(getRepositoryToken(Metric));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para o método create
  describe('create', () => {
    it('deve criar uma nova métrica', async () => {
      const createMetricDto = { timestamp: '2023-01-01T00:00:00Z', inverterId: 1, power: 100, temperature: 25 };
      const metric = {
        id: 1,
        ...createMetricDto,
        timestamp: new Date(createMetricDto.timestamp),
        inverter: { id: createMetricDto.inverterId } as Inverter
      } as Metric;
      
      mockRepository.create.mockReturnValue(metric);
      mockRepository.save.mockResolvedValue(metric);

      const result = await service.create(createMetricDto);
      expect(result).toEqual(metric);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createMetricDto,
        timestamp: new Date(createMetricDto.timestamp),
        inverter: { id: createMetricDto.inverterId } as Inverter
      });
      expect(mockRepository.save).toHaveBeenCalledWith(metric);
    });
  });

  // Teste para o método createMany
  describe('createMany', () => {
    it('deve criar várias métricas', async () => {
      const createMetricDtos = [
        { timestamp: '2023-01-01T00:00:00Z', inverterId: 1, power: 100, temperature: 25 },
        { timestamp: '2023-01-01T01:00:00Z', inverterId: 1, power: 110, temperature: 26 },
      ];
      const metrics = createMetricDtos.map((dto, index) => ({
        id: index + 1,
        power: dto.power,
        temperature: dto.temperature,
        timestamp: new Date(dto.timestamp),
        inverter: { id: dto.inverterId } as Inverter
      })) as Metric[];

      mockRepository.create.mockImplementation((dto) => ({ ...dto, timestamp: new Date(dto.timestamp) }));
      mockRepository.save.mockResolvedValue(metrics);

      const result = await service.createMany(createMetricDtos);
      expect(result).toEqual(metrics);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  // Teste para o método getMaxPowerPerDay
  describe('getMaxPowerPerDay', () => {
    it('deve retornar o máximo de potência por dia para um inversor', async () => {
      const inverterId = 1;
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-02T00:00:00Z';
      const metrics = [
        { id: 1, inverterId, power: 100, timestamp: new Date('2023-01-01T10:00:00Z') },
        { id: 2, inverterId, power: 150, timestamp: new Date('2023-01-01T12:00:00Z') },
      ];
      mockRepository.find.mockResolvedValue(metrics);

      const powerData = metrics.map(metric => ({
        value: metric.power,
        date: metric.timestamp,
      }));

      jest.spyOn(calcUtils, 'calculateMaxPowerPerDay').mockReturnValue({ '2023-01-01': 150 });

      const result = await service.getMaxPowerPerDay(inverterId, startDate, endDate);
      expect(result).toEqual({ '2023-01-01': 150 });
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          inverterId,
          timestamp: Between(new Date(startDate), new Date(endDate)),
          power: Not(IsNull()),
        },
        order: { timestamp: 'ASC' },
      });
      expect(calcUtils.calculateMaxPowerPerDay).toHaveBeenCalledWith(powerData);
    });
  });

  // Teste para o método getAvgTemperaturePerDay
  describe('getAvgTemperaturePerDay', () => {
    it('deve retornar a temperatura média por dia para um inversor', async () => {
      const inverterId = 1;
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-02T00:00:00Z';
      const metrics = [
        { id: 1, inverterId, temperature: 25, timestamp: new Date('2023-01-01T10:00:00Z') },
        { id: 2, inverterId, temperature: 30, timestamp: new Date('2023-01-01T12:00:00Z') },
      ];
      mockRepository.find.mockResolvedValue(metrics);

      const tempData = metrics.map(metric => ({
        value: metric.temperature,
        date: metric.timestamp,
      }));

      jest.spyOn(calcUtils, 'calculateAvgTemperaturePerDay').mockReturnValue({ '2023-01-01': 27.5 });

      const result = await service.getAvgTemperaturePerDay(inverterId, startDate, endDate);
      expect(result).toEqual({ '2023-01-01': 27.5 });
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          inverterId,
          timestamp: Between(new Date(startDate), new Date(endDate)),
          temperature: Not(IsNull()),
        },
        order: { timestamp: 'ASC' },
      });
      expect(calcUtils.calculateAvgTemperaturePerDay).toHaveBeenCalledWith(tempData);
    });
  });

  // Teste para o método calculateTotalGeneration
  describe('calculateTotalGeneration', () => {
    it('deve calcular a geração total de inversores', async () => {
      const inverterIds = [1, 2];
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-02T00:00:00Z';

      const metricsForInverter1 = [
        { id: 1, inverterId: 1, power: 100, timestamp: new Date('2023-01-01T10:00:00Z') },
        { id: 2, inverterId: 1, power: 120, timestamp: new Date('2023-01-01T11:00:00Z') },
      ];
      const metricsForInverter2: any[] = [];

      // Simulação de chamadas para cada inversorId
      mockRepository.find
        .mockResolvedValueOnce(metricsForInverter1)
        .mockResolvedValueOnce(metricsForInverter2);

      const powerData1 = metricsForInverter1.map(m => ({
        value: m.power,
        date: m.timestamp,
      }));

      jest.spyOn(calcUtils, 'calcInvertersGeneration').mockReturnValue(250);

      const result = await service.calculateTotalGeneration(inverterIds, startDate, endDate);
      expect(result).toEqual(250);
      expect(mockRepository.find).toHaveBeenNthCalledWith(1, {
        where: {
          inverterId: 1,
          timestamp: Between(new Date(startDate), new Date(endDate)),
          power: Not(IsNull()),
        },
        order: { timestamp: 'ASC' },
      });
      expect(mockRepository.find).toHaveBeenNthCalledWith(2, {
        where: {
          inverterId: 2,
          timestamp: Between(new Date(startDate), new Date(endDate)),
          power: Not(IsNull()),
        },
        order: { timestamp: 'ASC' },
      });
      expect(calcUtils.calcInvertersGeneration).toHaveBeenCalledWith([{ power: powerData1 }]);
    });
  });
}); 