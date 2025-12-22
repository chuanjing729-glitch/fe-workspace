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
exports.CoverageCollaborationManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CoverageCollaborationManager {
    constructor(options) {
        this.options = options;
    }
    async notifyApiChange(changeInfo) {
        if (!this.options.coveragePlugin?.enabled) {
            return;
        }
        try {
            const notificationPath = path.join(process.cwd(), '.api-tracker', 'api-change-notification.json');
            const dir = path.dirname(notificationPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(notificationPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                changeInfo,
                plugin: 'api-tracker-plugin'
            }, null, 2));
            console.log('[ApiTrackerPlugin] Notified coverage-plugin about API changes');
        }
        catch (error) {
            console.error('[ApiTrackerPlugin] Failed to notify coverage-plugin:', error);
        }
    }
    isCoveragePluginAvailable() {
        try {
            const coveragePluginPath = path.join(process.cwd(), 'node_modules', 'coverage-plugin');
            return fs.existsSync(coveragePluginPath);
        }
        catch (error) {
            return false;
        }
    }
    async getCoveragePluginConfig() {
        if (!this.options.coveragePlugin?.configPath) {
            return null;
        }
        try {
            const configPath = path.resolve(this.options.coveragePlugin.configPath);
            if (fs.existsSync(configPath)) {
                const configContent = fs.readFileSync(configPath, 'utf8');
                return JSON.parse(configContent);
            }
        }
        catch (error) {
            console.warn('[ApiTrackerPlugin] Failed to read coverage plugin config:', error);
        }
        return null;
    }
    async sendApiChangeData(changeData) {
        if (!this.options.coveragePlugin?.enabled) {
            return;
        }
        try {
            const coverageDir = path.join(process.cwd(), '.coverage');
            if (!fs.existsSync(coverageDir)) {
                fs.mkdirSync(coverageDir, { recursive: true });
            }
            const apiChangeFile = path.join(coverageDir, 'api-changes.json');
            fs.writeFileSync(apiChangeFile, JSON.stringify({
                timestamp: new Date().toISOString(),
                changes: changeData
            }, null, 2));
            console.log('[ApiTrackerPlugin] Sent API change data to coverage plugin');
        }
        catch (error) {
            console.error('[ApiTrackerPlugin] Failed to send API change data:', error);
        }
    }
}
exports.CoverageCollaborationManager = CoverageCollaborationManager;
//# sourceMappingURL=CoverageCollaborationManager.js.map