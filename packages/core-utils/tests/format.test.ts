import {
  formatPhone,
  formatCurrency,
  formatDate,
  formatFileSize,
  formatBankCard,
  formatIdCard,
  formatPercent,
  formatNumber
} from '../src/format'

describe('format模块测试', () => {
  describe('formatPhone', () => {
    test('格式化手机号', () => {
      expect(formatPhone('13800138000')).toBe('138****8000')
      expect(formatPhone('15912345678')).toBe('159****5678')
    })

    test('处理空值', () => {
      expect(formatPhone('')).toBe('')
      expect(formatPhone(null as any)).toBe('')
    })

    test('处理包含非数字字符的手机号', () => {
      expect(formatPhone('138-0013-8000')).toBe('138****8000')
      expect(formatPhone('138 0013 8000')).toBe('138****8000')
    })
  })

  describe('formatCurrency', () => {
    test('格式化金额', () => {
      expect(formatCurrency(12345.67)).toBe('¥12,345.67')
      expect(formatCurrency(1000)).toBe('¥1,000.00')
      expect(formatCurrency(999.999)).toBe('¥1,000.00')
    })

    test('自定义小数位数', () => {
      expect(formatCurrency(12345.67, 0)).toBe('¥12,346')
      expect(formatCurrency(12345.67, 3)).toBe('¥12,345.670')
    })

    test('自定义货币符号', () => {
      expect(formatCurrency(1234.56, 2, '$')).toBe('$1,234.56')
      expect(formatCurrency(1234.56, 2, '€')).toBe('€1,234.56')
    })

    test('处理字符串类型金额', () => {
      expect(formatCurrency('12345.67')).toBe('¥12,345.67')
    })

    test('处理空值和无效值', () => {
      expect(formatCurrency(null as any)).toBe('')
      expect(formatCurrency(undefined as any)).toBe('')
      expect(formatCurrency('abc')).toBe('')
    })
  })

  describe('formatDate', () => {
    test('格式化日期（默认格式）', () => {
      const date = new Date('2024-01-15T10:30:45')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    test('格式化日期（完整格式）', () => {
      const date = new Date('2024-01-15T10:30:45')
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-15 10:30:45')
    })

    test('格式化日期（自定义格式）', () => {
      const date = new Date('2024-01-15T10:30:45')
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/15')
      expect(formatDate(date, 'MM-DD HH:mm')).toBe('01-15 10:30')
    })

    test('处理字符串日期', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
      expect(formatDate('2024-01-15 10:30:45', 'YYYY-MM-DD HH:mm:ss')).toContain('2024-01-15')
    })

    test('处理空值和无效值', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate('invalid date')).toBe('')
    })
  })

  describe('formatFileSize', () => {
    test('格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
    })

    test('格式化带小数的文件大小', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB')
      expect(formatFileSize(1024 * 1.5)).toBe('1.50 KB')
    })

    test('自定义小数位数', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB')
      expect(formatFileSize(1536, 3)).toBe('1.500 KB')
    })
  })

  describe('formatBankCard', () => {
    test('格式化银行卡号', () => {
      expect(formatBankCard('6222021234567890')).toBe('6222 0212 3456 7890')
      expect(formatBankCard('1234567890123456')).toBe('1234 5678 9012 3456')
    })

    test('处理已有空格的银行卡号', () => {
      expect(formatBankCard('6222 0212 3456 7890')).toBe('6222 0212 3456 7890')
    })

    test('处理空值', () => {
      expect(formatBankCard('')).toBe('')
    })
  })

  describe('formatIdCard', () => {
    test('格式化18位身份证号', () => {
      expect(formatIdCard('110101199001011234')).toBe('110101********1234')
    })

    test('格式化15位身份证号', () => {
      expect(formatIdCard('110101900101123')).toBe('110101******123')
    })

    test('处理无效长度的身份证号', () => {
      expect(formatIdCard('123456')).toBe('123456')
    })

    test('处理空值', () => {
      expect(formatIdCard('')).toBe('')
    })
  })

  describe('formatPercent', () => {
    test('格式化百分比（小数形式）', () => {
      expect(formatPercent(0.123)).toBe('12.30%')
      expect(formatPercent(0.5)).toBe('50.00%')
      expect(formatPercent(1)).toBe('100.00%')
    })

    test('格式化百分比（整数形式）', () => {
      expect(formatPercent(50, 2, false)).toBe('50.00%')
      expect(formatPercent(75.5, 1, false)).toBe('75.5%')
    })

    test('自定义小数位数', () => {
      expect(formatPercent(0.12345, 0)).toBe('12%')
      expect(formatPercent(0.12345, 3)).toBe('12.345%')
    })

    test('处理空值', () => {
      expect(formatPercent(null as any)).toBe('')
      expect(formatPercent(undefined as any)).toBe('')
    })
  })

  describe('formatNumber', () => {
    test('格式化数字（千分位）', () => {
      expect(formatNumber(12345)).toBe('12,345')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1000)).toBe('1,000')
    })

    test('格式化小数', () => {
      expect(formatNumber(12345.67)).toBe('12,345.67')
      expect(formatNumber(12345.67, 1)).toBe('12,345.7')
      expect(formatNumber(12345.67, 0)).toBe('12,346')
    })

    test('处理字符串类型数字', () => {
      expect(formatNumber('12345')).toBe('12,345')
      expect(formatNumber('12345.67')).toBe('12,345.67')
    })

    test('处理空值和无效值', () => {
      expect(formatNumber(null as any)).toBe('')
      expect(formatNumber(undefined as any)).toBe('')
      expect(formatNumber('abc')).toBe('')
    })
  })
})
