import { ApiTrackerPlugin } from '../src/ApiTrackerPlugin';

describe('ApiTrackerPlugin', () => {
  it('should create an instance of the plugin', () => {
    const plugin = new ApiTrackerPlugin();
    expect(plugin).toBeInstanceOf(ApiTrackerPlugin);
  });

  it('should accept configuration options', () => {
    const options = {
      mode: 'openapi' as const,
      openApiSpec: './openapi.yaml',
      snapshotPath: './.api-tracker/api-snapshot.json'
    };
    
    const plugin = new ApiTrackerPlugin(options);
    expect(plugin).toBeInstanceOf(ApiTrackerPlugin);
  });

  it('should have default configuration values', () => {
    const plugin = new ApiTrackerPlugin();
    
    // Access private options through reflection for testing
    const options = (plugin as any).options;
    
    expect(options.enabled).toBe(true);
    expect(options.mode).toBe('openapi');
    expect(options.snapshotPath).toBe('./.api-tracker/api-snapshot.json');
    expect(options.diffReportPath).toBe('./.api-tracker/diff-report.json');
  });
});