"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfigLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SecurityConfigLoader {
    constructor(options) {
        this.options = options;
        this.config = {};
        this.configPath = options.securityConfigPath || './.api-tracker/security-config.json';
    }
    async load() {
        try {
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (!fs.existsSync(this.configPath)) {
                await this.createDefaultConfig();
            }
            const configFileContent = fs.readFileSync(this.configPath, 'utf8');
            this.config = JSON.parse(configFileContent);
        }
        catch (error) {
            console.warn('Failed to load security config, using defaults:', error);
            this.config = this.getDefaultConfig();
        }
    }
    async save() {
        try {
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Failed to save security config:', error);
        }
    }
    get(key, defaultValue) {
        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }
    set(key, value) {
        this.config[key] = value;
    }
    getConfig() {
        return this.config;
    }
    async createDefaultConfig() {
        this.config = this.getDefaultConfig();
        await this.save();
    }
    getDefaultConfig() {
        return {
            maskedKeys: [
                'authorization',
                'auth',
                'token',
                'password',
                'secret',
                'key'
            ],
            sensitiveHeaders: [
                'authorization',
                'cookie',
                'x-api-key',
                'x-auth-token'
            ],
            maskingPatterns: [
                {
                    pattern: '\\b(?:\\d[ -]*?){13,16}\\b',
                    replacement: '****-****-****-****'
                },
                {
                    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
                    replacement: '***@***.***'
                }
            ],
            validationRules: {
                maxResponseTime: 5000,
                allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                restrictedResponseHeaders: [
                    'server',
                    'x-powered-by'
                ]
            }
        };
    }
}
exports.SecurityConfigLoader = SecurityConfigLoader;
//# sourceMappingURL=SecurityConfigLoader.js.map