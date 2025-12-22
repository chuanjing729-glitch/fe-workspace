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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiCollector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
class OpenApiCollector {
    constructor(options) {
        this.options = options;
    }
    async collect() {
        try {
            if (!this.options.openApiSpec) {
                throw new Error('OpenAPI specification path or URL is not configured');
            }
            let specData;
            if (this.options.openApiSpec.startsWith('http')) {
                const response = await axios_1.default.get(this.options.openApiSpec);
                specData = response.data;
            }
            else {
                const fullPath = path.resolve(this.options.openApiSpec);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`OpenAPI specification file not found: ${fullPath}`);
                }
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                try {
                    specData = JSON.parse(fileContent);
                }
                catch (jsonError) {
                    try {
                        const yaml = await Promise.resolve().then(() => __importStar(require('js-yaml')));
                        specData = yaml.load(fileContent);
                    }
                    catch (yamlError) {
                        throw new Error('Failed to parse OpenAPI specification as JSON or YAML');
                    }
                }
            }
            this.validateOpenApiSpec(specData);
            return this.extractApiInfo(specData);
        }
        catch (error) {
            console.error('Error collecting OpenAPI data:', error);
            throw error;
        }
    }
    validateOpenApiSpec(spec) {
        if (!spec.openapi) {
            throw new Error('Invalid OpenAPI specification: missing "openapi" field');
        }
        if (!spec.info) {
            throw new Error('Invalid OpenAPI specification: missing "info" field');
        }
        if (!spec.paths) {
            throw new Error('Invalid OpenAPI specification: missing "paths" field');
        }
    }
    extractApiInfo(spec) {
        const apiInfo = {
            openapi: spec.openapi,
            info: spec.info,
            servers: spec.servers || [],
            paths: {},
            components: spec.components || {}
        };
        for (const [path, pathItem] of Object.entries(spec.paths)) {
            apiInfo.paths[path] = {};
            for (const [method, operation] of Object.entries(pathItem)) {
                if (this.isHttpMethod(method)) {
                    apiInfo.paths[path][method.toUpperCase()] = this.extractOperationInfo(operation);
                }
            }
        }
        return apiInfo;
    }
    extractOperationInfo(operation) {
        return {
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            tags: operation.tags || []
        };
    }
    isHttpMethod(method) {
        const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];
        return httpMethods.includes(method.toLowerCase());
    }
}
exports.OpenApiCollector = OpenApiCollector;
//# sourceMappingURL=OpenApiCollector.js.map