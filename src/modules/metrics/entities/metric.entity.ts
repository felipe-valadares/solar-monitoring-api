import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Inverter } from '../../inverters/entities/inverter.entity';

@Entity()
export class Metric {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'float' })
  power!: number;

  @Column({ type: 'float' })
  temperature!: number;

  @ManyToOne(() => Inverter, inverter => inverter.metrics, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'inverterId' })
  inverter!: Inverter;
}