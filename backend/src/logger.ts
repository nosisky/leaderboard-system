import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

export class NebulaLogger {
  private context: Record<string, any> = {};

  constructor(context?: Record<string, any>) {
    if (context) this.context = { ...context };
  }

  addContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
  }

  private log(level: string, message: string, meta?: any) {
    logger.log(level, message, { ...this.context, ...meta });
  }

  info(msg: string, meta?: any) { this.log("info", msg, meta); }
  warn(msg: string, meta?: any) { this.log("warn", msg, meta); }
  error(msg: string, meta?: any) { this.log("error", msg, meta); }
  debug(msg: string, meta?: any) { this.log("debug", msg, meta); }

  logError(err: Error, msg?: string, meta?: any) {
    this.log("error", msg || "Error occurred", { error: err.message, stack: err.stack, ...meta });
  }

  performance(op: string, duration: number, meta?: any) {
    this.log("info", `Performance: ${op}`, { operation: op, duration, unit: "ms", ...meta });
  }
}

export function createLambdaLogger(): NebulaLogger {
  return new NebulaLogger();
}

export { logger };
