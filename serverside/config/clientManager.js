/**
 * Service Client Manager
 */

const azdev = require('azure-devops-node-api');
const config = require('./environment');
const { globalLogger } = require('../utils/azureLogger');

class ServiceClientManager {
    constructor() {
        this.clients = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            globalLogger.debug('Service clients already initialized');
            return;
        }

        try {
            globalLogger.info('Initializing service clients...');
            this._initializeAzureDevOpsClient();
            this.initialized = true;
            globalLogger.info('Service clients initialized successfully');
        } catch (error) {
            globalLogger.error('Failed to initialize service clients', error);
            throw error;
        }
    }

    _initializeAzureDevOpsClient() {
        try {
            const authHandler = azdev.getPersonalAccessTokenHandler(
                config.ado.pat || 'dummy-token'
            );

            const connection = new azdev.WebApi(
                config.ado.orgUrl,
                authHandler
            );

            this.clients.set('ado', connection);
            globalLogger.debug('Azure DevOps client initialized', {
                orgUrl: config.ado.orgUrl,
                project: config.ado.project
            });
        } catch (error) {
            globalLogger.error('Failed to initialize Azure DevOps client', error);
            throw error;
        }
    }

    getAzureDevOpsClient() {
        if (!this.clients.has('ado')) {
            throw new Error('Azure DevOps client not initialized. Call initialize() first.');
        }
        return this.clients.get('ado');
    }

    getClient(name) {
        return this.clients.get(name);
    }

    registerClient(name, client) {
        this.clients.set(name, client);
        globalLogger.debug(`Client registered: ${name}`);
    }

    async cleanup() {
        try {
            globalLogger.info('Cleaning up service clients...');
            this.clients.clear();
            this.initialized = false;
            globalLogger.info('Service clients cleaned up');
        } catch (error) {
            globalLogger.error('Error during service client cleanup', error);
        }
    }

    isInitialized() {
        return this.initialized;
    }
}

const clientManager = new ServiceClientManager();

module.exports = clientManager;
