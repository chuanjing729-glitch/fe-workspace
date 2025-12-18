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
exports.HttpCrawler = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const jsdom_1 = require("jsdom");
class HttpCrawler {
    constructor(options) {
        this.crawledUrls = new Set();
        this.apiEndpoints = new Set();
        this.options = options;
    }
    async crawl() {
        try {
            if (!this.options.crawler?.urls || this.options.crawler.urls.length === 0) {
                throw new Error('No URLs configured for crawling');
            }
            this.crawledUrls.clear();
            this.apiEndpoints.clear();
            for (const url of this.options.crawler.urls) {
                await this.crawlUrl(url);
            }
            return {
                endpoints: Array.from(this.apiEndpoints),
                crawledUrls: Array.from(this.crawledUrls)
            };
        }
        catch (error) {
            console.error('Error during crawling:', error);
            throw error;
        }
    }
    async crawlUrl(url) {
        if (this.crawledUrls.has(url)) {
            return;
        }
        if (this.crawledUrls.size > 100) {
            console.warn('Crawling limit reached, stopping crawl');
            return;
        }
        this.crawledUrls.add(url);
        console.log(`Crawling URL: ${url}`);
        try {
            const htmlContent = await this.fetchPage(url);
            this.extractApiEndpoints(htmlContent, url);
            if (this.shouldFollowLinks()) {
                const links = this.extractLinks(htmlContent, url);
                for (const link of links) {
                    await this.crawlUrl(link);
                }
            }
        }
        catch (error) {
            console.warn(`Failed to crawl ${url}:`, error);
        }
    }
    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            const timeout = this.options.crawler?.timeout || 10000;
            const followRedirects = this.options.crawler?.followRedirects ?? true;
            const client = url.startsWith('https') ? https : http;
            const req = client.get(url, { timeout }, (res) => {
                if (followRedirects && (res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
                    this.crawlUrl(new URL(res.headers.location, url).href).then(() => resolve(''), reject);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }
    extractApiEndpoints(htmlContent, baseUrl) {
        try {
            const dom = new jsdom_1.JSDOM(htmlContent);
            const document = dom.window.document;
            const scriptTags = document.querySelectorAll('script');
            scriptTags.forEach((script) => {
                if (script.textContent) {
                    this.findApiEndpointsInText(script.textContent, baseUrl);
                }
            });
            const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
            inlineScripts.forEach((script) => {
                if (script.textContent) {
                    this.findApiEndpointsInText(script.textContent, baseUrl);
                }
            });
            const elementsWithDataAttrs = document.querySelectorAll('[data-api], [data-endpoint]');
            elementsWithDataAttrs.forEach((el) => {
                const apiAttr = el.getAttribute('data-api') || el.getAttribute('data-endpoint');
                if (apiAttr) {
                    this.apiEndpoints.add(new URL(apiAttr, baseUrl).href);
                }
            });
        }
        catch (error) {
            console.warn('Error extracting API endpoints from HTML:', error);
        }
    }
    findApiEndpointsInText(text, baseUrl) {
        const patterns = [
            /\/api\/[a-zA-Z0-9\-_\/.]*/g,
            /\/rest\/[a-zA-Z0-9\-_\/.]*/g,
            /\/v\d+\/[a-zA-Z0-9\-_\/.]*/g,
            /\/graphql/g,
            /url\s*:\s*['"][^'"]*\/api[^'"]*['"]/g,
            /fetch\(['"][^'"]*\/api[^'"]*['"]\)/g,
            /xhr\.open\([^,]*,\s*['"][^'"]*\/api[^'"]*['"]\)/g
        ];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach((match) => {
                    const urlMatch = match.match(/['"]([^'"]*\/api[^'"]*)['"]|\/(api|rest|v\d+|graphql)[^\s'")}]*/);
                    if (urlMatch && urlMatch[1]) {
                        try {
                            const fullUrl = new URL(urlMatch[1], baseUrl).href;
                            this.apiEndpoints.add(fullUrl);
                        }
                        catch (e) {
                        }
                    }
                    else if (urlMatch && urlMatch[0]) {
                        try {
                            const fullUrl = new URL(urlMatch[0], baseUrl).href;
                            this.apiEndpoints.add(fullUrl);
                        }
                        catch (e) {
                        }
                    }
                });
            }
        }
    }
    extractLinks(htmlContent, baseUrl) {
        const links = [];
        try {
            const dom = new jsdom_1.JSDOM(htmlContent);
            const document = dom.window.document;
            const anchorTags = document.querySelectorAll('a[href]');
            anchorTags.forEach((anchor) => {
                const href = anchor.getAttribute('href');
                if (href) {
                    try {
                        const fullUrl = new URL(href, baseUrl).href;
                        if (new URL(baseUrl).origin === new URL(fullUrl).origin) {
                            links.push(fullUrl);
                        }
                    }
                    catch (e) {
                    }
                }
            });
        }
        catch (error) {
            console.warn('Error extracting links from HTML:', error);
        }
        return links;
    }
    shouldFollowLinks() {
        return false;
    }
}
exports.HttpCrawler = HttpCrawler;
//# sourceMappingURL=HttpCrawler.js.map