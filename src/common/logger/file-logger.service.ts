import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger extends ConsoleLogger {
  private static logFolder = path.join(process.cwd(), 'logs');
  public static logFilePath = path.join(FileLogger.logFolder, 'app.log');

  constructor(context: string = '') {
    super(context);
    FileLogger.initLogger();
  }

  /**
   * Inicializa a pasta e o arquivo de log, se ainda não existirem.
   */
  private static initLogger() {
    console.log('Pasta de log definida:', FileLogger.logFolder);
    console.log('Arquivo de log definido:', FileLogger.logFilePath);

    if (!fs.existsSync(FileLogger.logFolder)) {
      fs.mkdirSync(FileLogger.logFolder, { recursive: true });
      console.log('Pasta de log criada:', FileLogger.logFolder);
    }
    if (!fs.existsSync(FileLogger.logFilePath)) {
      fs.writeFileSync(FileLogger.logFilePath, '');
      console.log('Arquivo de log criado:', FileLogger.logFilePath);
    }
  }

  /**
   * Escreve a mensagem de log no arquivo.
   */
  private writeToFile(message: string) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(FileLogger.logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Erro ao escrever log no arquivo', err);
      }
    });
  }

  log(message: any, context?: string) {
    this.writeToFile(`LOG ${context ? `[${context}]` : ''} ${message}`);
    super.log(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.writeToFile(`ERROR ${context ? `[${context}]` : ''} ${message} - trace: ${trace}`);
    super.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    this.writeToFile(`WARN ${context ? `[${context}]` : ''} ${message}`);
    super.warn(message, context);
  }

  debug(message: any, context?: string) {
    this.writeToFile(`DEBUG ${context ? `[${context}]` : ''} ${message}`);
    super.debug(message, context);
  }

  verbose(message: any, context?: string) {
    this.writeToFile(`VERBOSE ${context ? `[${context}]` : ''} ${message}`);
    super.verbose(message, context);
  }
} 