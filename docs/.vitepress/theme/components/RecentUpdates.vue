<script setup>
import { useData, withBase } from 'vitepress'
const { theme } = useData()
const updates = theme.value.recentUpdates || []
</script>

<template>
  <div v-if="updates.length > 0" class="recent-updates">
    <div class="container">
      <h2 class="section-title">📅 最近更新</h2>
      <div class="update-list">
        <a v-for="item in updates" :key="item.path" :href="withBase(item.path)" class="update-item">
          <div class="update-content">
            <span class="update-title">{{ item.title }}</span>
            <span class="update-date">{{ item.date }}</span>
          </div>
          <div class="update-arrow">→</div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recent-updates {
  padding: 64px 32px;
  background-color: var(--vp-c-bg-soft);
}

.container {
  max-width: 1152px;
  margin: 0 auto;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.update-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.update-item {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.update-item:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.update-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.update-date {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.update-arrow {
  font-size: 18px;
  color: var(--vp-c-text-3);
  opacity: 0.5;
}

.update-item:hover .update-arrow {
  color: var(--vp-c-brand-1);
  opacity: 1;
}

@media (max-width: 640px) {
  .recent-updates {
    padding: 48px 24px;
  }
}
</style>
