// Performance utilities for preventing duplicate operations and optimizing interactions

export class Debouncer {
    private timers: Map<string, NodeJS.Timeout> = new Map();

    debounce<T extends (...args: unknown[]) => unknown>(
        key: string,
        fn: T,
        delay: number = 300
    ): (...args: Parameters<T>) => void {
        return (...args: Parameters<T>) => {
            const existingTimer = this.timers.get(key);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            const newTimer = setTimeout(() => {
                fn(...args);
                this.timers.delete(key);
            }, delay);

            this.timers.set(key, newTimer);
        };
    }

    clear(key?: string) {
        if (key) {
            const timer = this.timers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.timers.delete(key);
            }
        } else {
            // Clear all timers
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers.clear();
        }
    }
}

export class Throttler {
    private lastExecution: Map<string, number> = new Map();

    throttle<T extends (...args: unknown[]) => unknown>(
        key: string,
        fn: T,
        delay: number = 1000
    ): (...args: Parameters<T>) => void {
        return (...args: Parameters<T>) => {
            const now = Date.now();
            const lastTime = this.lastExecution.get(key) || 0;

            if (now - lastTime >= delay) {
                fn(...args);
                this.lastExecution.set(key, now);
            }
        };
    }

    reset(key?: string) {
        if (key) {
            this.lastExecution.delete(key);
        } else {
            this.lastExecution.clear();
        }
    }
}

export class OperationLock {
    private locks: Set<string> = new Set();

    async execute<T>(
        key: string,
        operation: () => Promise<T>
    ): Promise<T> {
        if (this.locks.has(key)) {
            throw new Error('Operation already in progress');
        }

        this.locks.add(key);

        try {
            return await operation();
        } finally {
            this.locks.delete(key);
        }
    }

    isLocked(key: string): boolean {
        return this.locks.has(key);
    }

    release(key: string) {
        this.locks.delete(key);
    }

    clear() {
        this.locks.clear();
    }
}

// Global instances
export const debouncer = new Debouncer();
export const throttler = new Throttler();
export const operationLock = new OperationLock();

// Utility functions
export function createDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number = 300,
    key?: string
): (...args: Parameters<T>) => void {
    const callbackKey = key || fn.name || 'anonymous';
    return debouncer.debounce(callbackKey, fn, delay);
}

export function createThrottledCallback<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number = 1000,
    key?: string
): (...args: Parameters<T>) => void {
    const callbackKey = key || fn.name || 'anonymous';
    return throttler.throttle(callbackKey, fn, delay);
}

export async function withOperationLock<T>(
    key: string,
    operation: () => Promise<T>
): Promise<T> {
    return operationLock.execute(key, operation);
}

// Button click prevention
export function preventDoubleClick<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number = 1000
): (...args: Parameters<T>) => void {
    let isClicked = false;
    
    return (...args: Parameters<T>) => {
        if (isClicked) return;
        
        isClicked = true;
        fn(...args);
        
        setTimeout(() => {
            isClicked = false;
        }, delay);
    };
}

// Form submission prevention
export function preventDuplicateSubmission<T extends (...args: unknown[]) => unknown>(
    fn: T
): (...args: Parameters<T>) => Promise<void> {
    const lockKey = 'form-submission';
    
    return async (...args: Parameters<T>) => {
        if (operationLock.isLocked(lockKey)) {
            return;
        }
        
        await operationLock.execute(lockKey, () => fn(...args));
    };
}
