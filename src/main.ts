import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { FileLogger } from './common/logger/file-logger.service';
import { overrideConsoleMethods } from './common/logger/console-override';

async function bootstrap() {
  overrideConsoleMethods();
  
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger('Main')
  });
  
  // Ativa a transformação dos parâmetros para os tipos esperados nos DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configurar filtro de exceções global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Monitoramento de Usinas Fotovoltaicas')
    .setDescription('API para monitoramento e análise de dados de usinas fotovoltaicas')
    .setVersion('1.0')
    .addTag('usinas')
    .addTag('inversores')
    .addTag('métricas')
    .addTag('importação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Aplicação rodando na porta 3000`);
  console.log(`Logs disponíveis em: ${FileLogger.logFilePath}`);
}

bootstrap(); 