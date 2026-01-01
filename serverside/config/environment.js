/**
 * Environment Configuration
 * Supports local development and Azure deployment
 */

require('dotenv').config();

const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',

    ado: {
        orgUrl: process.env.AZDO_ORG_URL || '',
        project: process.env.AZDO_PROJECT || 'Epos',
        apiVersion: process.env.AZDO_API_VERSION || '5.0',
        pat: process.env.AZDO_PAT || '',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    cors: {
        skipCors: String(process.env.SKIP_CORS || 'false').toLowerCase() === 'true',
        allowedOrigins: (() => {
            const defaults = ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3008'];
            const extraRaw = (process.env.ALLOWED_ORIGINS || '').toString();
            const extras = extraRaw
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            return [...defaults, ...extras];
        })(),
    },

    logging: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
        format: process.env.LOG_FORMAT || 'json',
    },

    uploads: {
        maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '52428800', 10),
        uploadDir: process.env.UPLOAD_DIR || './uploads',
    },

    database: {
        url: process.env.DATABASE_URL || '',
    },

    appInsights: {
        enabled: String(process.env.APPINSIGHTS_ENABLED || 'false').toLowerCase() === 'true',
        instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY || '',
    },

    cache: {
        dir: process.env.CACHE_DIR || './data/cache',
        ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '120', 10)
    }
};

function validateConfig() {
    if (config.isProduction) {
        if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-key-change-in-production') {
            throw new Error('JWT_SECRET must be set in production');
        }
        if (!config.ado.pat) {
            throw new Error('AZDO_PAT (Azure DevOps PAT) must be set in production');
        }
    }
}

validateConfig();

module.exports = config;
