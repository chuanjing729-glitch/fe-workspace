import { RuleChecker, CheckResult } from '../types'

/**
 * 表单验证规则检查器
 * 检测表单缺少验证规则的情况
 */
export const formValidationRule: RuleChecker = {
  name: '表单验证检查',
  description: '检测表单缺少验证规则，确保用户输入的数据符合预期',
  
  check(filePath: string, content: string): CheckResult[] {
    const results: CheckResult[] = []

    // 只检查 Vue 文件
    if (!filePath.endsWith('.vue')) {
      return results
    }

    const lines = content.split('\n')
    let inTemplate = false
    let hasElForm = false
    let hasRules = false

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 标记是否在 template 区域
      if (line.includes('<template>')) {
        inTemplate = true
      }
      if (line.includes('</template>')) {
        inTemplate = false
      }

      if (inTemplate) {
        // 1. 检测 el-form 是否绑定 rules
        if (line.includes('<el-form')) {
          hasElForm = true
          if (!line.includes(':rules') && !line.includes('v-bind:rules')) {
            results.push({
              rule: '表单验证检查',
              type: 'warning',
              message: 'el-form 未绑定验证规则',
              suggestion: '添加 :rules="formRules" 绑定验证规则',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          } else {
            hasRules = true
          }
        }

        // 2. 检测 el-form-item 是否设置 prop
        if (line.includes('<el-form-item') && hasElForm) {
          if (!line.includes('prop=')) {
            // 查找后续行
            const nextLine = lines[index + 1] || ''
            if (!nextLine.includes('prop=')) {
              results.push({
                rule: '表单验证检查',
                type: 'warning',
                message: 'el-form-item 未设置 prop 属性',
                suggestion: '设置 prop 属性以启用表单验证',
                file: filePath,
                line: lineNumber,
                code: line.trim()
              })
            }
          }
        }

        // 3. 检测 input 缺少必填标识
        if (line.match(/<el-input|<input/) && !line.includes('required')) {
          const prevLine = lines[index - 1] || ''
          if (prevLine.includes('label=') && prevLine.includes('*')) {
            // 有星号标识但 input 未设置 required
            results.push({
              rule: '表单验证检查',
              type: 'warning',
              message: '表单项有必填标识但未设置 required',
              suggestion: '在 el-form-item 中设置 :required="true"',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          }
        }

        // 4. 检测邮箱输入框缺少类型验证
        if (line.match(/label=["'].*邮箱.*["']/i) || line.match(/placeholder=["'].*邮箱.*["']/i)) {
          if (!content.includes('type: \'email\'') && !content.includes('validator')) {
            results.push({
              rule: '表单验证检查',
              type: 'warning',
              message: '邮箱输入框缺少格式验证',
              suggestion: '在验证规则中添加 type: \'email\' 或自定义验证器',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          }
        }

        // 5. 检测手机号输入框缺少验证
        if (line.match(/label=["'].*手机.*["']/i) || line.match(/placeholder=["'].*手机.*["']/i)) {
          if (!content.includes('pattern') && !content.includes('validator')) {
            results.push({
              rule: '表单验证检查',
              type: 'warning',
              message: '手机号输入框缺少格式验证',
              suggestion: '使用 @51jbs/vue2-toolkit 的手机号验证器',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          }
        }

        // 6. 检测密码输入框缺少强度验证
        if (line.match(/type=["']password["']/)) {
          if (!content.includes('min:') && !content.includes('minLength')) {
            results.push({
              rule: '表单验证检查',
              type: 'warning',
              message: '密码输入框缺少最小长度验证',
              suggestion: '添加密码长度和强度验证规则',
              file: filePath,
              line: lineNumber,
              code: line.trim()
            })
          }
        }
      }

      // 7. 检测 data 中定义了 formRules 但为空
      if (line.includes('formRules:') && line.includes('{}')) {
        results.push({
          rule: '表单验证检查',
          type: 'warning',
          message: '定义了 formRules 但未配置验证规则',
          suggestion: '为表单字段添加具体的验证规则',
          file: filePath,
          line: lineNumber,
          code: line.trim()
        })
      }

      // 8. 检测提交时未调用表单验证
      if (line.match(/submit.*\(|handleSubmit|onSubmit/)) {
        const nextLines = lines.slice(index, Math.min(index + 10, lines.length)).join('\n')
        
        if (!nextLines.includes('this.$refs') && !nextLines.includes('validate')) {
          results.push({
            rule: '表单验证检查',
            type: 'error',
            message: '表单提交未调用验证方法',
            suggestion: '在提交前调用 this.$refs.form.validate() 验证表单',
            file: filePath,
            line: lineNumber,
            code: line.trim()
          })
        }
      }
    })

    // 9. 如果有 el-form 但没有定义 rules
    if (hasElForm && !hasRules && !content.includes('formRules') && !content.includes('rules:')) {
      results.push({
        rule: '表单验证检查',
        type: 'warning',
        message: '文件包含 el-form 但未定义验证规则',
        suggestion: '在 data 中定义 formRules 并绑定到表单',
        file: filePath,
        line: 1
      })
    }

    return results
  }
}
