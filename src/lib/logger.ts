// Environment-aware logging utility

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

class Logger {
    private logLevel: LogLevel;
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        
        // Set log level based on environment
        if (!this.isDevelopment) {
            this.logLevel = LogLevel.ERROR; // Only errors in production
        } else {
            this.logLevel = LogLevel.DEBUG; // All logs in development
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel;
    }

    private formatMessage(level: string, message: string, ...args: any[]): [string, ...any[]] {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;
        
        if (this.isDevelopment) {
            return [`${prefix} ${message}`, ...args];
        } else {
            // In production, send structured logs to monitoring service
            // For now, just return the formatted message
            return [`${prefix} ${message}`];
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const [formattedMessage, ...formattedArgs] = this.formatMessage('DEBUG', message, ...args);
            console.debug(formattedMessage, ...formattedArgs);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const [formattedMessage, ...formattedArgs] = this.formatMessage('INFO', message, ...args);
            console.info(formattedMessage, ...formattedArgs);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const [formattedMessage, ...formattedArgs] = this.formatMessage('WARN', message, ...args);
            console.warn(formattedMessage, ...formattedArgs);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const [formattedMessage, ...formattedArgs] = this.formatMessage('ERROR', message, ...args);
            console.error(formattedMessage, ...formattedArgs);
            
            // In production, you might want to send errors to a monitoring service
            if (!this.isDevelopment) {
                // errorTracking.captureException(new Error(message), { extra: args });
            }
        }
    }

    // Development-only logging
    devLog(message: string, ...args: any[]): void {
        if (this.isDevelopment) {
            console.log(`[DEV] ${message}`, ...args);
        }
    }
}

// Global logger instance
export const logger = new Logger();

// Convenience exports
export const log = {
    debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
    info: (message: string, ...args: any[]) => logger.info(message, ...args),
    warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
    error: (message: string, ...args: any[]) => logger.error(message, ...args),
    dev: (message: string, ...args: any[]) => logger.devLog(message, ...args),
};

// Replace console methods in production
if (process.env.NODE_ENV === 'production') {
    // Override console methods to prevent sensitive data logging
    const originalConsole = { ...console };
    
    console.log = () => {}; // Disable console.log
    console.debug = () => {}; // Disable console.debug
    console.info = () => {}; // Disable console.info
    
    // Keep warn and error but route through logger
    console.warn = (message: string, ...args: any[]) => logger.warn(message, ...args);
    console.error = (message: string, ...args: any[]) => logger.error(message, ...args);
    
    // Store original for emergency debugging
    (console as any).original = originalConsole;
}
