# 分支管理规范

## 概述

本文档定义了项目的分支管理策略，确保代码变更经过适当审查和测试后再合并到主分支，保障代码质量和项目稳定性。

## 分支模型

采用简化版的GitHub Flow模型：

```
main分支         # 生产就绪代码，受保护
↓
feature/*分支     # 功能开发分支，用于具体功能实现
↓
hotfix/*分支      # 紧急修复分支，用于生产环境紧急问题修复
```

## 分支命名规范

### 功能分支
- 格式：`feature/功能描述`
- 示例：`feature/add-coverage-report`、`feature/improve-api-tracking`

### 修复分支
- 格式：`fix/问题描述`
- 示例：`fix/resolve-memory-leak`、`fix/update-dependencies`

### 热修复分支
- 格式：`hotfix/紧急修复描述`
- 示例：`hotfix/critical-security-patch`

## 分支保护规则

### main分支保护
1. 禁止直接推送（Direct Push）
2. 必须通过Pull Request合并
3. 至少一人审查（在双人协作模式下即为您）
4. 通过所有CI检查
5. 状态检查必须通过（如测试、构建等）

## 开发流程

### 1. 创建功能分支
```bash
# 从main分支创建新功能分支
git checkout main
git pull origin main
git checkout -b feature/新功能名称
```

### 2. 开发与提交
```bash
# 进行开发工作
# ...

# 提交更改
git add .
git commit -m "feat: 实现某某功能"

# 推送分支
git push origin feature/新功能名称
```

### 3. 创建Pull Request
1. 在GitHub上访问仓库页面
2. 点击"Compare & pull request"按钮
3. 填写PR描述：
   - 功能说明
   - 实现要点
   - 测试情况
   - 相关问题链接（如有）

### 4. 代码审查
1. 您作为审查者检查代码
2. 提出修改建议
3. 确认无误后批准合并

### 5. 修改与完善
```bash
# 根据审查反馈进行修改
# ...

# 推送更新
git add .
git commit -m "address review comments"
git push origin feature/新功能名称
```

### 6. 合并与清理
1. 获得批准后合并PR
2. 使用"Squash and merge"保持历史清洁
3. 删除已合并的feature分支

## 版本发布策略

### 语义化版本控制
遵循SemVer规范（MAJOR.MINOR.PATCH）：
- PATCH：向后兼容的问题修复（如：1.0.1）
- MINOR：向后兼容的功能新增（如：1.1.0）
- MAJOR：不兼容的API变更（如：2.0.0）

### 发布流程
1. 确认main分支代码稳定
2. 更新CHANGELOG.md
3. 打Git标签：`git tag v1.0.0`
4. 推送标签：`git push origin v1.0.0`
5. 在GitHub上创建Release

## 紧急修复流程

### 1. 创建热修复分支
```bash
# 从main分支创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/紧急修复描述
```

### 2. 修复与测试
```bash
# 进行紧急修复
# ...

# 提交并推送
git add .
git commit -m "hotfix: 修复紧急问题"
git push origin hotfix/紧急修复描述
```

### 3. 创建PR并合并
1. 创建PR到main分支
2. 优先审查和合并
3. 打补丁版本标签

### 4. 后续同步
```bash
# 将修复同步到开发分支（如有）
git checkout develop
git merge main
git push origin develop
```

## 最佳实践

### 1. 分支管理
- 保持功能分支短小精悍
- 定期将main分支合并到功能分支
- 及时删除已合并的分支

### 2. 提交信息
- 使用清晰、简洁的提交信息
- 遵循约定式提交格式
- 每个提交只做一件事

### 3. Pull Request
- PR描述要详细完整
- 包含测试情况说明
- 关联相关Issue（如有）

## 常见问题

### 1. 如何处理分支冲突？
```bash
# 将main分支合并到功能分支
git checkout feature/功能名称
git fetch origin
git merge origin/main
# 解决冲突后提交
git add .
git commit
git push origin feature/功能名称
```

### 2. 如何撤销错误的提交？
```bash
# 撤销最近一次提交但保留更改
git reset HEAD~1

# 撤销最近一次提交并丢弃更改
git reset --hard HEAD~1
```

### 3. 如何修改提交信息？
```bash
# 修改最近一次提交信息
git commit --amend -m "新的提交信息"
```

## 总结

通过严格的分支管理策略和审查流程，我们可以确保：
1. 所有代码变更都经过适当审查
2. 主分支始终保持稳定
3. 变更有完整的审计跟踪
4. 团队成员职责明确

这套流程特别适用于双人协作开发模式，确保您对所有代码变更都有充分的控制权和知情权。