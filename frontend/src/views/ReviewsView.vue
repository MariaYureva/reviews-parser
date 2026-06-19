<template>
  <div class="page">
    <header>
      <RouterLink to="/settings" class="back">← Назад</RouterLink>
      <button class="logout" @click="auth.logout()">Выйти</button>
    </header>

    <div v-if="store.organization" class="org-header">
      <h1>{{ store.organization.name }}</h1>
      <div class="stats">
        <span>⭐ {{ store.organization.avg_rating }}</span>
        <span>{{ store.organization.ratings_count }} оценок</span>
        <span>{{ store.organization.reviews_count }} отзывов</span>
      </div>
    </div>

    <div v-if="store.loading" class="loading">Загрузка...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>

    <div v-else>
      <div
          v-for="review in store.reviews"
          :key="review.id"
          class="review-card"
      >
        <div class="review-header">
          <span class="author">{{ review.author }}</span>
          <span class="stars">{{ '★'.repeat(Number(review.rating)) }}{{ '☆'.repeat(5 - Number(review.rating)) }}</span>
          <span class="date">{{ review.date }}</span>
        </div>
        <p class="review-text">{{ review.text || '—' }}</p>
      </div>

      <div class="pagination">
        <button
            :disabled="store.currentPage <= 1"
            @click="changePage(store.currentPage - 1)"
        >← Пред.</button>
        <span>{{ store.currentPage }} / {{ store.lastPage }}</span>
        <button
            :disabled="store.currentPage >= store.lastPage"
            @click="changePage(store.currentPage + 1)"
        >След. →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOrganizationStore } from '../stores/organization'

const auth = useAuthStore()
const store = useOrganizationStore()
const route = useRoute()
const orgId = route.params.id

onMounted(() => {
  store.fetchReviews(orgId, 1)
})

function changePage(page) {
  store.fetchReviews(orgId, page)
  window.scrollTo(0, 0)
}
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.back { color: #2563eb; text-decoration: none; font-weight: 500; }
.logout {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.org-header { margin-bottom: 24px; }
h1 { margin: 0 0 8px; }
.stats { display: flex; gap: 16px; color: #555; font-size: 15px; }
.loading { text-align: center; padding: 40px; color: #666; }
.error { color: #dc2626; padding: 20px; }
.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.author { font-weight: 600; }
.stars { color: #f59e0b; letter-spacing: 2px; }
.date { color: #999; font-size: 13px; margin-left: auto; }
.review-text { margin: 0; color: #333; line-height: 1.6; }
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 32px;
}
.pagination button {
  padding: 10px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>