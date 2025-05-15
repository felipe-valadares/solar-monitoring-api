import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInverters1689000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inverter',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'model',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'serialNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'plantId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'inverter',
      new TableForeignKey({
        columnNames: ['plantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'plant',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }),
    );

    const table = await queryRunner.getTable('inverter');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk =>
        fk.columnNames.includes('plantId'),
      );
      if (foreignKey) {
        if (
          foreignKey.onDelete?.toUpperCase() !== 'CASCADE' ||
          foreignKey.onUpdate?.toUpperCase() !== 'CASCADE'
        ) {
          // Caso não esteja configurada corretamente, remove e recria a foreign key
          await queryRunner.dropForeignKey('inverter', foreignKey);
          await queryRunner.createForeignKey(
            'inverter',
            new TableForeignKey({
              columnNames: ['plantId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'plant',
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            }),
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('inverter');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('plantId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('inverter', foreignKey);
      }
      await queryRunner.query('DROP TABLE "inverter" CASCADE');
    }
  }
} 