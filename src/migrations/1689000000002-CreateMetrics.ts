import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMetrics1689000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'metric',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'power',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'temperature',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'inverterId',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'metric',
      new TableForeignKey({
        columnNames: ['inverterId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'inverter',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }),
    );

    // Criação dos índices com nomes entre aspas duplas
    await queryRunner.query(
      'CREATE INDEX "idx_metric_inverter_id" ON "metric" ("inverterId")'
    );
    await queryRunner.query(
      'CREATE INDEX "idx_metric_timestamp" ON "metric" ("timestamp")'
    );
    await queryRunner.query(
      'CREATE INDEX "idx_metric_inverter_timestamp" ON "metric" ("inverterId", "timestamp")'
    );

    // Verificação da foreign key para confirmar as opções de cascade
    const table = await queryRunner.getTable('metric');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk =>
        fk.columnNames.includes('inverterId'),
      );
      if (foreignKey) {
        if (
          foreignKey.onDelete?.toUpperCase() !== 'CASCADE' ||
          foreignKey.onUpdate?.toUpperCase() !== 'CASCADE'
        ) {
          // Caso não esteja configurada corretamente, remove e recria a foreign key
          await queryRunner.dropForeignKey('metric', foreignKey);
          await queryRunner.createForeignKey(
            'metric',
            new TableForeignKey({
              columnNames: ['inverterId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'inverter',
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            }),
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('metric');
    if (table) {
      // Remove a foreign key associada
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('inverterId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('metric', foreignKey);
      }

      // Verifica e remove os índices, se existirem, utilizando os métodos do QueryRunner
      const inverterIdIndex = table.indices.find(index => index.name === 'idx_metric_inverter_id');
      if (inverterIdIndex) {
        await queryRunner.dropIndex('metric', 'idx_metric_inverter_id');
      }

      const timestampIndex = table.indices.find(index => index.name === 'idx_metric_timestamp');
      if (timestampIndex) {
        await queryRunner.dropIndex('metric', 'idx_metric_timestamp');
      }

      const inverterTimestampIndex = table.indices.find(index => index.name === 'idx_metric_inverter_timestamp');
      if (inverterTimestampIndex) {
        await queryRunner.dropIndex('metric', 'idx_metric_inverter_timestamp');
      }
    }

    // Remove a tabela (os índices serão descartados automaticamente junto com ela)
    await queryRunner.dropTable('metric');
  }
}