import { ApiTrackerPluginOptions } from '../types';
export declare class HttpCrawler {
    private readonly options;
    private readonly crawledUrls;
    private readonly apiEndpoints;
    constructor(options: ApiTrackerPluginOptions);
    crawl(): Promise<any>;
    private crawlUrl;
    private fetchPage;
    private extractApiEndpoints;
    private findApiEndpointsInText;
    private extractLinks;
    private shouldFollowLinks;
}
//# sourceMappingURL=HttpCrawler.d.ts.map