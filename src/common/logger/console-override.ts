import { FileLogger } from './file-logger.service';

const fileLogger = new FileLogger('Console');

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleInfo = console.info;

export function overrideConsoleMethods() {
    console.log = (...args: any[]) => {
        fileLogger.log(args.join(' '));
        originalConsoleLog.apply(console, args);
    };

  console.warn = (...args: any[]) => {
    fileLogger.warn(args.join(' '));
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    fileLogger.error(args.join(' '));
    originalConsoleError.apply(console, args);
  };

  console.info = (...args: any[]) => {
    fileLogger.log(args.join(' '));
    originalConsoleInfo.apply(console, args);
  };

} 

