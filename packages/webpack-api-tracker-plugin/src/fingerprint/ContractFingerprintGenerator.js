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
exports.ContractFingerprintGenerator = void 0;
const crypto = __importStar(require("crypto"));
class ContractFingerprintGenerator {
    generate(contract) {
        const normalizedData = this.normalizeContract(contract);
        const jsonString = JSON.stringify(normalizedData);
        return crypto.createHash('sha256').update(jsonString).digest('hex');
    }
    normalizeContract(contract) {
        const normalized = {
            paths: {}
        };
        if (contract.openapi)
            normalized.openapi = contract.openapi;
        if (contract.info)
            normalized.info = contract.info;
        if (contract.servers)
            normalized.servers = contract.servers;
        if (contract.components)
            normalized.components = contract.components;
        const sortedPaths = Object.keys(contract.paths).sort();
        for (const path of sortedPaths) {
            const pathItem = contract.paths[path];
            normalized.paths[path] = {};
            const sortedMethods = Object.keys(pathItem).sort();
            for (const method of sortedMethods) {
                const operation = pathItem[method];
                normalized.paths[path][method] = this.normalizeOperation(operation);
            }
        }
        return normalized;
    }
    normalizeOperation(operation) {
        const normalized = {};
        if (operation.operationId)
            normalized.operationId = operation.operationId;
        if (operation.summary)
            normalized.summary = operation.summary;
        if (operation.description)
            normalized.description = operation.description;
        if (operation.tags)
            normalized.tags = [...operation.tags].sort();
        if (operation.parameters) {
            normalized.parameters = operation.parameters
                .map((param) => this.normalizeParameter(param))
                .sort((a, b) => {
                if (a.name !== b.name)
                    return a.name.localeCompare(b.name);
                return a.in.localeCompare(b.in);
            });
        }
        if (operation.requestBody) {
            normalized.requestBody = this.normalizeRequestBody(operation.requestBody);
        }
        if (operation.responses) {
            normalized.responses = this.normalizeResponses(operation.responses);
        }
        return normalized;
    }
    normalizeParameter(parameter) {
        const normalized = {
            name: parameter.name,
            in: parameter.in
        };
        if (parameter.required !== undefined)
            normalized.required = parameter.required;
        if (parameter.description)
            normalized.description = parameter.description;
        if (parameter.schema)
            normalized.schema = this.normalizeSchema(parameter.schema);
        return normalized;
    }
    normalizeRequestBody(requestBody) {
        const normalized = {};
        if (requestBody.description)
            normalized.description = requestBody.description;
        if (requestBody.required !== undefined)
            normalized.required = requestBody.required;
        if (requestBody.content) {
            normalized.content = {};
            const sortedContentTypes = Object.keys(requestBody.content).sort();
            for (const contentType of sortedContentTypes) {
                const mediaType = requestBody.content[contentType];
                normalized.content[contentType] = {};
                if (mediaType.schema) {
                    normalized.content[contentType].schema = this.normalizeSchema(mediaType.schema);
                }
            }
        }
        return normalized;
    }
    normalizeResponses(responses) {
        const normalized = {};
        const sortedCodes = Object.keys(responses).sort();
        for (const code of sortedCodes) {
            const response = responses[code];
            normalized[code] = {};
            if (response.description)
                normalized[code].description = response.description;
            if (response.content) {
                normalized[code].content = {};
                const sortedContentTypes = Object.keys(response.content).sort();
                for (const contentType of sortedContentTypes) {
                    const mediaType = response.content[contentType];
                    normalized[code].content[contentType] = {};
                    if (mediaType.schema) {
                        normalized[code].content[contentType].schema = this.normalizeSchema(mediaType.schema);
                    }
                }
            }
        }
        return normalized;
    }
    normalizeSchema(schema) {
        return schema;
    }
    compare(fingerprint1, fingerprint2) {
        return fingerprint1 === fingerprint2;
    }
}
exports.ContractFingerprintGenerator = ContractFingerprintGenerator;
//# sourceMappingURL=ContractFingerprintGenerator.js.map