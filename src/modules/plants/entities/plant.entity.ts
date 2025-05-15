import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Inverter } from '../../inverters/entities/inverter.entity';

@Entity()
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  capacity!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => Inverter, inverter => inverter.plant)
  inverters!: Inverter[];
} 