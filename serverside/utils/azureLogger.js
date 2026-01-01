/**
 * Azure-compatible structured logger
 */

class AzureLogger {
    constructor(context = null) {
        this.context = context;
        this.invocationId = context?.invocationId || `local-${Date.now()}`;
    }

    trace(message, data = null) {
        const logEntry = this._formatLog('TRACE', message, data);
        console.log(logEntry);
    }

    debug(message, data = null) {
        const logEntry = this._formatLog('DEBUG', message, data);
        console.log(logEntry);
    }

    info(message, data = null) {
        const logEntry = this._formatLog('INFO', message, data);
        console.log(logEntry);
    }

    warn(message, data = null) {
        const logEntry = this._formatLog('WARN', message, data);
        console.warn(logEntry);
    }

    error(message, error = null) {
        const errorData = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : error;
        const logEntry = this._formatLog('ERROR', message, errorData);
        console.error(logEntry);
    }

    _formatLog(level, message, data) {
        const timestamp = new Date().toISOString();
        const entry = {
            timestamp,
            level,
            message,
            invocationId: this.invocationId
        };

        if (data) {
            entry.data = data;
        }

        return JSON.stringify(entry);
    }

    createChild(context) {
        const child = new AzureLogger(this.context);
        child.invocationId = context?.invocationId || this.invocationId;
        return child;
    }
}

const globalLogger = new AzureLogger();

module.exports = AzureLogger;
module.exports.globalLogger = globalLogger;
