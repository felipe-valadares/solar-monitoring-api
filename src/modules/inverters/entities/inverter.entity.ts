import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Plant } from '../../plants/entities/plant.entity';
import { Metric } from '../../metrics/entities/metric.entity';

@Entity()
export class Inverter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  model!: string;

  @Column({ nullable: true })
  serialNumber!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @ManyToOne(() => Plant, plant => plant.inverters, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plantId' })
  plant?: Plant;

  @OneToMany(() => Metric, metric => metric.inverter)
  metrics!: Metric[];
} 