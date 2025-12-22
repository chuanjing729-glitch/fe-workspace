<template>
  <div class="test-panel">
    <h2>🧪 测试面板</h2>
    <p class="subtitle">点击按钮测试不同的代码覆盖场景</p>
    
    <div class="test-section">
      <h3>基础函数测试</h3>
      <div class="test-buttons">
        <button @click="testAdd">测试加法</button>
        <button @click="testSubtract">测试减法</button>
        <button @click="testGrade">测试评分</button>
      </div>
      <div v-if="results.basic" class="result">{{ results.basic }}</div>
    </div>

    <div class="test-section">
      <h3>验证逻辑测试</h3>
      <div class="test-buttons">
        <button @click="testValidUser">有效用户</button>
        <button @click="testInvalidUser">无效用户</button>
        <button @click="testInvalidEmail">无效邮箱</button>
      </div>
      <div v-if="results.validation" class="result">{{ results.validation }}</div>
    </div>

    <div class="test-section">
      <h3>数组操作测试</h3>
      <div class="test-buttons">
        <button @click="testFilterEven">过滤偶数</button>
        <button @click="testSum">数组求和</button>
        <button @click="testFibonacci">斐波那契数列</button>
      </div>
      <div v-if="results.array" class="result">{{ results.array }}</div>
    </div>

    <div class="test-section">
      <h3>类与对象测试</h3>
      <div class="test-buttons">
        <button @click="testCalculator">计算器</button>
        <button @click="testDeepClone">深拷贝</button>
        <button @click="testMerge">对象合并</button>
      </div>
      <div v-if="results.object" class="result">{{ results.object }}</div>
    </div>

    <div class="test-section">
      <h3>异常处理测试</h3>
      <div class="test-buttons">
        <button @click="testJSONParse">JSON 解析</button>
        <button @click="testDivisionByZero">除零错误</button>
        <button @click="testDayName">星期名称</button>
      </div>
      <div v-if="results.error" class="result">{{ results.error }}</div>
    </div>

    <div class="coverage-tips">
      <h3>📊 覆盖率提示</h3>
      <ul>
        <li>✅ 每次点击按钮都会执行相应的代码</li>
        <li>✅ 右下角浮窗实时显示覆盖率</li>
        <li>✅ 等待5秒后查看 .coverage/latest.html</li>
        <li>✅ 尝试点击所有按钮以提高覆盖率</li>
      </ul>
      <div class="coverage-goal">
        <strong>目标覆盖率：80%</strong>
        <p>当前场景包含 {{ testCount }} 个测试用例</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  add,
  subtract,
  getGrade,
  validateUser,
  filterEvenNumbers,
  sumArray,
  fibonacci,
  Calculator,
  deepClone,
  mergeObjects,
  parseJSON,
  getDayName
} from './utils.js';

export default {
  name: 'TestPanel',
  data() {
    return {
      results: {
        basic: '',
        validation: '',
        array: '',
        object: '',
        error: ''
      },
      testCount: 13,
      calculator: null
    };
  },
  methods: {
    // 基础函数测试
    testAdd() {
      const result = add(10, 20);
      this.results.basic = `✅ 10 + 20 = ${result}`;
    },
    
    testSubtract() {
      const result = subtract(50, 30);
      this.results.basic = `✅ 50 - 30 = ${result}`;
    },
    
    testGrade() {
      const grades = [95, 85, 75, 65, 55];
      const results = grades.map(score => `${score}分: ${getGrade(score)}`);
      this.results.basic = `✅ 评分结果: ${results.join(', ')}`;
    },

    // 验证逻辑测试
    testValidUser() {
      const user = {
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25
      };
      const result = validateUser(user);
      this.results.validation = result.valid 
        ? '✅ 用户验证通过' 
        : `❌ ${result.error}`;
    },
    
    testInvalidUser() {
      const result = validateUser(null);
      this.results.validation = result.valid 
        ? '✅ 用户验证通过' 
        : `❌ ${result.error}`;
    },
    
    testInvalidEmail() {
      const user = { name: '李四', email: 'invalid-email' };
      const result = validateUser(user);
      this.results.validation = result.valid 
        ? '✅ 用户验证通过' 
        : `❌ ${result.error}`;
    },

    // 数组操作测试
    testFilterEven() {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const even = filterEvenNumbers(numbers);
      this.results.array = `✅ 偶数: [${even.join(', ')}]`;
    },
    
    testSum() {
      const numbers = [1, 2, 3, 4, 5];
      const sum = sumArray(numbers);
      this.results.array = `✅ 数组和: ${sum}`;
    },
    
    testFibonacci() {
      const fib = fibonacci(10);
      this.results.array = `✅ 斐波那契(10): [${fib.join(', ')}]`;
    },

    // 类与对象测试
    testCalculator() {
      try {
        this.calculator = new Calculator();
        const result = this.calculator
          .add(10)
          .multiply(2)
          .subtract(5)
          .divide(3)
          .getResult();
        this.results.object = `✅ 计算器结果: ${result.toFixed(2)}`;
      } catch (error) {
        this.results.object = `❌ ${error.message}`;
      }
    },
    
    testDeepClone() {
      const original = {
        name: '测试',
        nested: { value: 100 },
        array: [1, 2, 3]
      };
      const cloned = deepClone(original);
      cloned.nested.value = 200;
      this.results.object = `✅ 深拷贝成功，原始值: ${original.nested.value}, 克隆值: ${cloned.nested.value}`;
    },
    
    testMerge() {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const merged = mergeObjects(obj1, obj2);
      this.results.object = `✅ 合并结果: ${JSON.stringify(merged)}`;
    },

    // 异常处理测试
    testJSONParse() {
      const validJSON = '{"name": "test", "value": 123}';
      const invalidJSON = '{invalid json}';
      
      const result1 = parseJSON(validJSON);
      const result2 = parseJSON(invalidJSON);
      
      this.results.error = result1 
        ? `✅ 有效JSON解析成功，无效JSON返回: ${result2}` 
        : '❌ JSON解析失败';
    },
    
    testDivisionByZero() {
      try {
        const calc = new Calculator();
        calc.add(100).divide(0);
        this.results.error = '❌ 应该抛出错误';
      } catch (error) {
        this.results.error = `✅ 捕获到预期错误: ${error.message}`;
      }
    },
    
    testDayName() {
      const days = [0, 1, 2, 3, 4, 5, 6, 7];
      const names = days.map(day => getDayName(day));
      this.results.error = `✅ 星期: ${names.slice(0, 7).join(', ')}`;
    }
  }
};
</script>

<style scoped>
.test-panel {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.test-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.test-buttons button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.test-buttons button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.test-buttons button:active {
  transform: translateY(0);
}

.result {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #2c3e50;
  margin-top: 10px;
}

.coverage-tips {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.coverage-tips h3 {
  margin-bottom: 15px;
}

.coverage-tips ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.coverage-tips li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}

.coverage-goal {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 6px;
  text-align: center;
}

.coverage-goal strong {
  font-size: 18px;
  display: block;
  margin-bottom: 5px;
}

.coverage-goal p {
  margin: 5px 0 0 0;
  opacity: 0.9;
}
</style>
