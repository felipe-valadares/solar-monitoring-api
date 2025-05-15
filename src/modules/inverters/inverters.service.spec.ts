import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { InvertersService } from './inverters.service';
import { Inverter } from './entities/inverter.entity';
import { PlantsService } from '../plants/plants.service';
import { MetricsService } from '../metrics/metrics.service';

describe('InvertersService', () => {
  let service: InvertersService;
  let invertersRepository: Repository<Inverter>;
  let mockMetricsService: Partial<MetricsService>;
  let mockPlantsService: Partial<PlantsService>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    mockMetricsService = {
      getMaxPowerPerDay: jest.fn(),
      getAvgTemperaturePerDay: jest.fn(),
      calculateTotalGeneration: jest.fn(),
    };

    mockPlantsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvertersService,
        {
          provide: getRepositoryToken(Inverter),
          useValue: mockRepository,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
        {
          provide: PlantsService,
          useValue: mockPlantsService,
        },
      ],
    }).compile();

    service = module.get<InvertersService>(InvertersService);
    invertersRepository = module.get<Repository<Inverter>>(getRepositoryToken(Inverter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para o método create
  describe('create', () => {
    it('deve criar um novo inversor', async () => {
      const createInverterDto = { name: 'Inversor 1', model: 'Modelo A1', serialNumber: 'SN001', plantId: 1 };

      const fakePlant = {
        id: createInverterDto.plantId,
        name: 'Planta Fictícia',
        location: 'Local Exemplo',
        capacity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        inverters: []  // ajuste conforme a definição da entidade Plant
      };

      const inverterCreated = {
        id: 1,
        ...createInverterDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        plant: fakePlant,
        metrics: []
      } as Inverter;
      
      (mockPlantsService.findOne as jest.Mock).mockResolvedValue({ id: createInverterDto.plantId });
      mockRepository.create.mockReturnValue(inverterCreated);
      mockRepository.save.mockResolvedValue(inverterCreated);
      
      const result = await service.create(createInverterDto);
      expect(result).toEqual(inverterCreated);
      expect(mockPlantsService.findOne).toHaveBeenCalledWith(createInverterDto.plantId);
      expect(mockRepository.create).toHaveBeenCalledWith(createInverterDto);
      expect(mockRepository.save).toHaveBeenCalledWith(inverterCreated);
    });
  });

  // Teste para o método findAll
  describe('findAll', () => {
    it('deve retornar um array de inversores', async () => {
      const inverters = [
        { id: 1, name: 'Inversor 1' },
        { id: 2, name: 'Inversor 2' },
      ] as Inverter[];
      mockRepository.find.mockResolvedValue(inverters);
      
      const result = await service.findAll();
      expect(result).toEqual(inverters);
      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['plant'] });
    });
  });

  // Teste para o método findOne
  describe('findOne', () => {
    it('deve retornar um inversor pelo id', async () => {
      const inverter = { id: 1, name: 'Inversor 1', plant: {} } as Inverter;
      mockRepository.findOne.mockResolvedValue(inverter);

      const result = await service.findOne(1);
      expect(result).toEqual(inverter);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['plant'] });
    });

    it('deve lançar NotFoundException se o inversor não for encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // Teste para o método update
  describe('update', () => {
    it('deve atualizar um inversor', async () => {
      const inverterExistente = { id: 1, name: 'Inversor 1', plant: {} } as Inverter;
      const updateInverterDto = { name: 'Inversor Atualizado', plantId: 2 };

      mockRepository.findOne.mockResolvedValue(inverterExistente);
      // Se plantId for atualizado, verifica a existência da usina
      (mockPlantsService.findOne as jest.Mock).mockResolvedValue({ id: updateInverterDto.plantId });
      // Faz a mutação do objeto original para simular o comportamento do merge do TypeORM
      mockRepository.merge.mockImplementation((inverter, updateDto) => {
        Object.assign(inverter, updateDto);
        return inverter;
      });
      mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, updateInverterDto);
      expect(result).toEqual({ id: 1, name: 'Inversor Atualizado', plant: {}, plantId: 2 });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['plant'] });
      expect(mockPlantsService.findOne).toHaveBeenCalledWith(updateInverterDto.plantId);
      expect(mockRepository.merge).toHaveBeenCalledWith(inverterExistente, updateInverterDto);
      expect(mockRepository.save).toHaveBeenCalledWith({ id: 1, name: 'Inversor Atualizado', plant: {}, plantId: 2 });
    });
  });

  // Teste para o método remove
  describe('remove', () => {
    it('deve remover um inversor', async () => {
      const inverter = { id: 1, name: 'Inversor 1', plant: {} } as Inverter;
      mockRepository.findOne.mockResolvedValue(inverter);
      mockRepository.remove.mockResolvedValue(inverter);

      await service.remove(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['plant'] });
      expect(mockRepository.remove).toHaveBeenCalledWith(inverter);
    });
  });

  // Teste para o método getMaxPowerPerDay
  describe('getMaxPowerPerDay', () => {
    it('deve retornar o máximo de potência por dia para um inversor', async () => {
      const inverterId = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const inverter = { id: inverterId, name: 'Inversor 1', plant: {} } as Inverter;
      
      mockRepository.findOne.mockResolvedValue(inverter);
      const maxPowerData = { '2023-01-01': 100 };
      (mockMetricsService.getMaxPowerPerDay as jest.Mock).mockResolvedValue(maxPowerData);

      const result = await service.getMaxPowerPerDay(inverterId, startDate, endDate);
      expect(result).toEqual(maxPowerData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: inverterId }, relations: ['plant'] });
      expect(mockMetricsService.getMaxPowerPerDay).toHaveBeenCalledWith(inverterId, startDate, endDate);
    });
  });

  // Teste para o método getAvgTemperaturePerDay
  describe('getAvgTemperaturePerDay', () => {
    it('deve retornar a temperatura média por dia para um inversor', async () => {
      const inverterId = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const inverter = { id: inverterId, name: 'Inversor 1', plant: {} } as Inverter;
      
      mockRepository.findOne.mockResolvedValue(inverter);
      const avgTempData = { '2023-01-01': 25 };
      (mockMetricsService.getAvgTemperaturePerDay as jest.Mock).mockResolvedValue(avgTempData);

      const result = await service.getAvgTemperaturePerDay(inverterId, startDate, endDate);
      expect(result).toEqual(avgTempData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: inverterId }, relations: ['plant'] });
      expect(mockMetricsService.getAvgTemperaturePerDay).toHaveBeenCalledWith(inverterId, startDate, endDate);
    });
  });

  // Teste para o método calculateGeneration
  describe('calculateGeneration', () => {
    it('deve calcular a geração total para um inversor', async () => {
      const inverterId = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const inverter = { id: inverterId, name: 'Inversor 1', plant: {} } as Inverter;
      
      mockRepository.findOne.mockResolvedValue(inverter);
      const generationValue = 1234.56;
      (mockMetricsService.calculateTotalGeneration as jest.Mock).mockResolvedValue(generationValue);

      const result = await service.calculateGeneration(inverterId, startDate, endDate);
      expect(result).toEqual({ totalGeneration: generationValue });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: inverterId }, relations: ['plant'] });
      expect(mockMetricsService.calculateTotalGeneration).toHaveBeenCalledWith([inverterId], startDate, endDate);
    });
  });
}); 