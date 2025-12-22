/**
 * 工具函数模块
 * 用于测试不同的代码覆盖场景
 */

// 场景1：简单函数
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

// 场景2：条件分支
export function getGrade(score) {
    if (score >= 90) {
        return 'A';
    } else if (score >= 80) {
        return 'B';
    } else if (score >= 70) {
        return 'C';
    } else if (score >= 60) {
        return 'D';
    } else {
        return 'F';
    }
}

// 场景3：复杂逻辑
export function validateUser(user) {
    if (!user) {
        return { valid: false, error: 'User is required' };
    }

    if (!user.name || user.name.trim() === '') {
        return { valid: false, error: 'Name is required' };
    }

    if (!user.email || !user.email.includes('@')) {
        return { valid: false, error: 'Invalid email' };
    }

    if (user.age && (user.age < 0 || user.age > 150)) {
        return { valid: false, error: 'Invalid age' };
    }

    return { valid: true };
}

// 场景4：数组操作
export function filterEvenNumbers(numbers) {
    if (!Array.isArray(numbers)) {
        return [];
    }
    return numbers.filter(num => num % 2 === 0);
}

export function sumArray(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return 0;
    }
    return numbers.reduce((sum, num) => sum + num, 0);
}

// 场景5：对象操作
export function mergeObjects(...objects) {
    return Object.assign({}, ...objects);
}

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// 场景6：异步函数
export async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
}

//场景7：类定义
export class Calculator {
    constructor() {
        this.result = 0;
    }

    add(value) {
        this.result += value;
        return this;
    }

    subtract(value) {
        this.result -= value;
        return this;
    }

    multiply(value) {
        this.result *= value;
        return this;
    }

    divide(value) {
        if (value === 0) {
            throw new Error('Division by zero');
        }
        this.result /= value;
        return this;
    }

    reset() {
        this.result = 0;
        return this;
    }

    getResult() {
        return this.result;
    }
}

// 场景8：Switch 语句
export function getDayName(dayNumber) {
    switch (dayNumber) {
        case 0:
            return '星期日';
        case 1:
            return '星期一';
        case 2:
            return '星期二';
        case 3:
            return '星期三';
        case 4:
            return '星期四';
        case 5:
            return '星期五';
        case 6:
            return '星期六';
        default:
            return '无效的日期';
    }
}

// 场景9：Try-Catch
export function parseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parse error:', error);
        return null;
    }
}

// 场景10：循环
export function fibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const result = [0, 1];
    for (let i = 2; i < n; i++) {
        result.push(result[i - 1] + result[i - 2]);
    }
    return result;
}
