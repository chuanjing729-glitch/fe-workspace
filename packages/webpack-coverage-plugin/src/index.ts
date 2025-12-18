import { Compiler } from 'webpack';
import { Application, Request, Response } from 'express';
import ReportGenerator from './reporter';
import ImpactAnalyzer from './impact-analyzer';

interface WebpackCoveragePluginOptions {
  // 是否启用插件
  enabled?: boolean;
  // 插桩的文件模式
  include?: RegExp | string[];
  // 排除的文件模式
  exclude?: RegExp | string[];
  // 输出目录
  outputDir?: string;
  // 是否启用影响范围分析
  enableImpactAnalysis?: boolean;
  // 是否启用运行时小气泡
  enableOverlay?: boolean;
  // 质量门禁配置
  qualityGate?: {
    // 行覆盖率阈值 (默认: 80)
    lineCoverageThreshold?: number;
    // 分支覆盖率阈值 (默认: 80)
    branchCoverageThreshold?: number;
    // 受影响接口数阈值 (默认: 10)
    affectedInterfacesThreshold?: number;
  };
}

export class WebpackCoveragePlugin {
  private options: WebpackCoveragePluginOptions;

  constructor(options: WebpackCoveragePluginOptions = {}) {
    this.options = {
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: options.include || [],
      exclude: options.exclude,
      outputDir: options.outputDir || '.coverage',
      enableImpactAnalysis: options.enableImpactAnalysis !== false, // 默认启用
      enableOverlay: options.enableOverlay !== false, // 默认启用
      qualityGate: {
        lineCoverageThreshold: 80,
        branchCoverageThreshold: 80,
        affectedInterfacesThreshold: 10,
        ...options.qualityGate
      },
      ...options
    };
    
    // 如果没有提供 exclude 选项，则设置默认值
    if (!this.options.exclude) {
      this.options.exclude = [/node_modules/, /\.test\./, /\.spec\./] as unknown as RegExp | string[];
    }
  }

  apply(compiler: Compiler) {
    // 检查是否启用插件
    if (!this.options.enabled) {
      return;
    }

    // 在编译前阶段注册钩子
    compiler.hooks.compile.tap('WebpackCoveragePlugin', () => {
      console.log('[WebpackCoveragePlugin] 开始编译，启用覆盖率插桩');
    });

    // 在编译完成阶段注册钩子
    compiler.hooks.done.tap('WebpackCoveragePlugin', (stats) => {
      console.log('[WebpackCoveragePlugin] 编译完成');
      
      // 生成自测报告
      this.generateSelfTestReport();
    });

    // 注入 babel-plugin-istanbul 到编译流程
    compiler.hooks.normalModuleFactory.tap('WebpackCoveragePlugin', (nmf) => {
      nmf.hooks.beforeResolve.tap('WebpackCoveragePlugin', (resolveData: any) => {
        // 在这里可以修改解析逻辑
        // 注意：不要返回 resolveData 对象，而是修改它
        // 返回 undefined 表示继续处理
      });
    });

    // 集成到 devServer 中
    if (compiler.options.devServer) {
      const originalBefore = compiler.options.devServer.before;
      
      compiler.options.devServer.before = (app: Application, server: any, compilerInstance: any) => {
        // 调用原始的 before 函数
        if (originalBefore) {
          originalBefore(app, server, compilerInstance);
        }
        
        // 添加覆盖率数据上传接口
        app.post('/__coverage_upload', (req: Request, res: Response) => {
          console.log('[WebpackCoveragePlugin] 接收到覆盖率数据');
          // 这里处理覆盖率数据
          res.json({ success: true });
        });
        
        // 如果启用了运行时小气泡，注入相关资源
        if (this.options.enableOverlay) {
          // 注入小气泡CSS和JS
          app.get('/__coverage_overlay.css', (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'text/css');
            res.send(`
              /* 运行时小气泡样式 */
              #webpack-coverage-overlay {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: #42b983;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                transition: transform 0.2s;
              }
              
              #webpack-coverage-overlay:hover {
                transform: scale(1.1);
              }
              
              #webpack-coverage-overlay-panel {
                position: fixed;
                bottom: 70px;
                right: 20px;
                width: 300px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                padding: 15px;
                display: none;
              }
              
              #webpack-coverage-overlay-panel.visible {
                display: block;
              }
              
              .coverage-progress {
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
                margin: 10px 0;
              }
              
              .coverage-progress-bar {
                height: 100%;
                background: #42b983;
                transition: width 0.3s;
              }
            `);
          });
          
          app.get('/__coverage_overlay.js', (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(`
              // 运行时小气泡脚本
              (function() {
                // 创建小气泡元素
                const overlay = document.createElement('div');
                overlay.id = 'webpack-coverage-overlay';
                overlay.textContent = '95%';
                
                // 创建详情面板
                const panel = document.createElement('div');
                panel.id = 'webpack-coverage-overlay-panel';
                panel.innerHTML = '
                  <h3>覆盖率信息</h3>
                  <p>当前页面覆盖率: <strong>95%</strong></p>
                  <div class="coverage-progress">
                    <div class="coverage-progress-bar" style="width: 95%"></div>
                  </div>
                  <p>未覆盖代码块: 2</p>
                  <button onclick="window.location.reload()">刷新数据</button>
                ';
                
                // 添加到页面
                document.body.appendChild(overlay);
                document.body.appendChild(panel);
                
                // 点击小气泡切换面板显示
                overlay.addEventListener('click', function(e) {
                  e.stopPropagation();
                  panel.classList.toggle('visible');
                });
                
                // 点击页面其他地方隐藏面板
                document.addEventListener('click', function() {
                  panel.classList.remove('visible');
                });
                
                // 防止点击面板时隐藏面板
                panel.addEventListener('click', function(e) {
                  e.stopPropagation();
                });
              })();
            `);
          });
        }
      };
    }
  }

  private generateSelfTestReport(): void {
    // 创建报告生成器
    const reportGenerator = new ReportGenerator(this.options.outputDir);
    
    // 创建影响范围分析器
    const impactAnalyzer = new ImpactAnalyzer(process.cwd());
    
    // 分析项目依赖关系
    impactAnalyzer.analyzeDependencies();
    
    // 模拟变更的文件（在实际应用中，这将来自Git diff）
    const changedFiles = [
      'src/components/Button.jsx',
      'src/pages/HomePage.jsx',
      'src/utils/helper.js'
    ];
    
    // 分析影响范围
    const impactAnalysis = impactAnalyzer.analyzeImpact(changedFiles);
    
    // 获取Git信息
    const gitInfo = this.getGitInfo();
    
    // 获取硬件信息
    const hardwareInfo = this.getHardwareInfo();
    
    // 模拟测试结果
    const testReport = {
      timestamp: new Date(),
      environment: {
        nodeVersion: process.version,
        os: process.platform,
        gitName: gitInfo.name,
        gitHash: gitInfo.hash,
        gitBranch: gitInfo.branch,
        hardwareInfo: hardwareInfo
      },
      // 插件测试摘要
      pluginTestSummary: {
        total: 5,
        passed: 5,
        failed: 0,
        passRate: '100.00'
      },
      // 代码覆盖率摘要
      coverageSummary: {
        lineCoverage: 85,
        branchCoverage: 70,
        lineCoverageStatus: 'pass' as const,
        branchCoverageStatus: 'fail' as const
      },
      // 质量门禁配置
      qualityGateConfig: {
        lineCoverageThreshold: this.options.qualityGate?.lineCoverageThreshold || 80,
        branchCoverageThreshold: this.options.qualityGate?.branchCoverageThreshold || 80,
        affectedInterfacesThreshold: this.options.qualityGate?.affectedInterfacesThreshold || 10
      },
      pluginTestResults: [
        {
          testName: '插件实例化测试',
          status: 'pass' as const,
          duration: 2
        },
        {
          testName: '配置选项测试',
          status: 'pass' as const,
          duration: 1
        },
        {
          testName: 'Webpack 钩子注册测试',
          status: 'pass' as const,
          duration: 3
        },
        {
          testName: 'DevServer 集成测试',
          status: 'pass' as const,
          duration: 5
        },
        {
          testName: '覆盖率数据收集测试',
          status: 'pass' as const,
          duration: 4
        }
      ],
      impactAnalysis,
      codeInfo: {
        commitCodeLines: 150,
        codeComplexity: 2.5,
        importantCodeLevel: '中',
        complexityExplanation: '代码复杂度基于圈复杂度算法计算，数值越高表示代码越复杂，维护成本越高。',
        importanceExplanation: '重要代码重要程度根据代码位置、调用频率、业务关键性等因素综合评估。'
      },
      businessInfo: [
        {
          pageName: 'HomePage',
          componentName: 'Button',
          codeLines: 45,
          selfTestTotal: 10,
          selfTestPassed: 9,
          selfTestFailed: 1,
          severityLevel: 'medium' as const,
          apiStatus: 'unknown' as const
        },
        {
          pageName: 'UserProfile',
          componentName: 'Form',
          codeLines: 78,
          selfTestTotal: 15,
          selfTestPassed: 15,
          selfTestFailed: 0,
          severityLevel: 'low' as const,
          apiStatus: 'unknown' as const
        }
      ]
    };
    
    // 生成报告
    reportGenerator.generateReports(testReport);
  }
  
  /**
   * 获取Git信息
   */
  private getGitInfo(): { name: string; hash: string; branch: string } {
    // 在实际实现中，这里会调用Git命令获取真实信息
    // 暂时返回模拟数据
    return {
      name: '张三',
      hash: 'a1b2c3d4e5f67890',
      branch: 'feature/new-feature'
    };
  }
  
  /**
   * 获取硬件信息
   */
  private getHardwareInfo(): string {
    // 在实际实现中，这里会获取真实的硬件信息
    // 暂时返回模拟数据
    return 'macOS 14.7.7, 8核CPU, 16GB内存';
  }
}

export default WebpackCoveragePlugin;
