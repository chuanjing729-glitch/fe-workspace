# 分支管理规范

## 概述

本文档定义了项目的分支管理策略，专门针对双人协作开发模式设计。

在我们只有两人（您和AI助手）的协作模式下，采用最简单的分支管理方式，通过直接对话沟通来协调开发工作。

## 分支模型

```
main分支         # 主分支，包含稳定代码
↓
feature/*分支     # 功能分支，用于开发新功能
```

## 分支命名

- 功能分支：`feature/功能描述`
- 修复分支：`fix/问题描述`

例如：
- `feature/add-coverage-report`
- `fix/resolve-memory-leak`

## 开发流程

### 1. 创建分支
```bash
git checkout main
git pull
git checkout -b feature/功能名称
```

### 2. 开发提交
```bash
# 开发工作
# ...

git add .
git commit -m "描述"
git push origin feature/功能名称
```

### 3. 对话确认
- 我会告诉您功能已完成
- 您可以查看代码或测试功能
- 有问题我就修改
- 没问题就继续下一步

### 4. 合并删除
```bash
git checkout main
git pull
git merge feature/功能名称
git push origin main
git push origin --delete feature/功能名称
git branch -d feature/功能名称
```

## 约定

1. 功能开发在独立分支进行
2. 完成后通过对话确认再合并
3. 合并后删除功能分支
4. 保持分支简洁，避免长期存在

这就是我们两人协作的分支管理方式，简单直接。