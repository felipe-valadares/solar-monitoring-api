import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantsService } from './plants.service';
import { Plant } from './entities/plant.entity';
import { MetricsService } from '../metrics/metrics.service';
import { NotFoundException } from '@nestjs/common';

describe('PlantsService', () => {
  let service: PlantsService;
  let repository: Repository<Plant>;
  let metricsService: MetricsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockMetricsService = {
    calculateTotalGeneration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantsService,
        {
          provide: getRepositoryToken(Plant),
          useValue: mockRepository,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<PlantsService>(PlantsService);
    repository = module.get<Repository<Plant>>(getRepositoryToken(Plant));
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new plant', async () => {
      const createPlantDto = { name: 'Test Plant', location: 'Test Location', capacity: 1000 };
      const plant = { id: 1, ...createPlantDto } as Plant;
      
      mockRepository.create.mockReturnValue(plant);
      mockRepository.save.mockResolvedValue(plant);
      
      expect(await service.create(createPlantDto)).toEqual(plant);
      expect(mockRepository.create).toHaveBeenCalledWith(createPlantDto);
      expect(mockRepository.save).toHaveBeenCalledWith(plant);
    });
  });

  describe('findAll', () => {
    it('should return an array of plants', async () => {
      const plants = [{ id: 1, name: 'Plant 1' }, { id: 2, name: 'Plant 2' }] as Plant[];
      mockRepository.find.mockResolvedValue(plants);
      
      expect(await service.findAll()).toEqual(plants);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a plant by id', async () => {
      const plant = { id: 1, name: 'Plant 1', inverters: [], location: 'Test Location', capacity: 1000, createdAt: new Date(), updatedAt: new Date() } as Plant;
      mockRepository.findOne.mockResolvedValue(plant);
      
      expect(await service.findOne(1)).toEqual(plant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['inverters'],
      });
    });

    it('should throw NotFoundException if plant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateGeneration', () => {
    it('should calculate total generation for a plant', async () => {
      const plant = { 
        id: 1, 
        name: 'Plant 1', 
        inverters: [{ id: 1 }, { id: 2 }] 
      } as Plant;
      
      mockRepository.findOne.mockResolvedValue(plant);
      mockMetricsService.calculateTotalGeneration.mockResolvedValue(1234.56);
      
      const result = await service.calculateGeneration(1, '2023-01-01', '2023-01-31');
      
      expect(result).toEqual({ totalGeneration: 1234.56 });
      expect(mockMetricsService.calculateTotalGeneration).toHaveBeenCalledWith(
        [1, 2],
        '2023-01-01',
        '2023-01-31'
      );
    });
  });
}); 