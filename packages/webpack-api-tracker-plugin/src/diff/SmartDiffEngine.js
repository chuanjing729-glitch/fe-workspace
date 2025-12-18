"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartDiffEngine = void 0;
class SmartDiffEngine {
    diff(oldContract, newContract) {
        const result = {
            added: [],
            removed: [],
            modified: []
        };
        const allPaths = new Set([
            ...Object.keys(oldContract.paths),
            ...Object.keys(newContract.paths)
        ]);
        for (const path of allPaths) {
            const oldPathItem = oldContract.paths[path];
            const newPathItem = newContract.paths[path];
            if (!oldPathItem && newPathItem) {
                this.addPathChanges(result.added, path, newPathItem);
            }
            else if (oldPathItem && !newPathItem) {
                this.addPathChanges(result.removed, path, oldPathItem);
            }
            else if (oldPathItem && newPathItem) {
                this.comparePathItems(result, path, oldPathItem, newPathItem);
            }
        }
        return result;
    }
    addPathChanges(changes, path, pathItem) {
        for (const [method, operation] of Object.entries(pathItem)) {
            changes.push({
                path,
                method,
                type: changes === changes ? 'added' : 'removed',
                details: operation
            });
        }
    }
    comparePathItems(result, path, oldPathItem, newPathItem) {
        const allMethods = new Set([
            ...Object.keys(oldPathItem),
            ...Object.keys(newPathItem)
        ]);
        for (const method of allMethods) {
            const oldOperation = oldPathItem[method];
            const newOperation = newPathItem[method];
            if (!oldOperation && newOperation) {
                result.added.push({
                    path,
                    method,
                    type: 'added',
                    details: newOperation
                });
            }
            else if (oldOperation && !newOperation) {
                result.removed.push({
                    path,
                    method,
                    type: 'removed',
                    details: oldOperation
                });
            }
            else if (oldOperation && newOperation) {
                this.compareOperations(result, path, method, oldOperation, newOperation);
            }
        }
    }
    compareOperations(result, path, method, oldOperation, newOperation) {
        const changes = {};
        if (oldOperation.operationId !== newOperation.operationId) {
            changes.operationId = {
                from: oldOperation.operationId,
                to: newOperation.operationId
            };
        }
        if (oldOperation.summary !== newOperation.summary) {
            changes.summary = {
                from: oldOperation.summary,
                to: newOperation.summary
            };
        }
        if (JSON.stringify(oldOperation.parameters) !== JSON.stringify(newOperation.parameters)) {
            changes.parameters = {
                from: oldOperation.parameters,
                to: newOperation.parameters
            };
        }
        if (JSON.stringify(oldOperation.requestBody) !== JSON.stringify(newOperation.requestBody)) {
            changes.requestBody = {
                from: oldOperation.requestBody,
                to: newOperation.requestBody
            };
        }
        if (JSON.stringify(oldOperation.responses) !== JSON.stringify(newOperation.responses)) {
            changes.responses = {
                from: oldOperation.responses,
                to: newOperation.responses
            };
        }
        if (Object.keys(changes).length > 0) {
            result.modified.push({
                path,
                method,
                type: 'modified',
                details: changes
            });
        }
    }
    generateReport(diffResult) {
        let report = '# API Contract Diff Report\n\n';
        if (diffResult.added.length > 0) {
            report += '## Added Endpoints\n\n';
            for (const change of diffResult.added) {
                report += `- **${change.method.toUpperCase()}** \`${change.path}\` - New endpoint\n`;
            }
            report += '\n';
        }
        if (diffResult.removed.length > 0) {
            report += '## Removed Endpoints\n\n';
            for (const change of diffResult.removed) {
                report += `- **${change.method.toUpperCase()}** \`${change.path}\` - Endpoint removed\n`;
            }
            report += '\n';
        }
        if (diffResult.modified.length > 0) {
            report += '## Modified Endpoints\n\n';
            for (const change of diffResult.modified) {
                report += `- **${change.method.toUpperCase()}** \`${change.path}\`\n`;
                for (const [field, diff] of Object.entries(change.details)) {
                    report += `  - ${field}: \`${diff.from}\` → \`${diff.to}\`
`;
                }
            }
            report += '\n';
        }
        if (report === '# API Contract Diff Report\n\n') {
            report += 'No changes detected.\n';
        }
        return report;
    }
}
exports.SmartDiffEngine = SmartDiffEngine;
//# sourceMappingURL=SmartDiffEngine.js.map