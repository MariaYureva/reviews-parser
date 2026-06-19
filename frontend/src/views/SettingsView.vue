<template>
  <div class="page">
    <header>
      <h1>Настройки</h1>
      <button class="logout" @click="auth.logout()">Выйти</button>
    </header>

    <div class="card">
      <h2>Карточка организации на Яндекс.Картах</h2>
      <p class="hint">Вставьте ссылку на организацию, например:<br>
        <code>https://yandex.ru/maps/org/название/123456789/</code>
      </p>
      <form @submit.prevent="handleSubmit">
        <input
            v-model="url"
            type="url"
            placeholder="https://yandex.ru/maps/org/..."
            required
        />
        <button type="submit" :disabled="store.loading">
          {{ store.loading ? 'Парсим отзывы...' : 'Загрузить отзывы' }}
        </button>
      </form>
      <p v-if="store.error" class="error">{{ store.error }}</p>
    </div>

    <div v-if="store.organization" class="card org-info">
      <h2>{{ store.organization.name }}</h2>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ store.organization.avg_rating }}</span>
          <span class="stat-label">Рейтинг</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ store.organization.ratings_count }}</span>
          <span class="stat-label">Оценок</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ store.organization.reviews_count }}</span>
          <span class="stat-label">Отзывов</span>
        </div>
      </div>
      <RouterLink :to="`/reviews/${store.organization.id}`" class="btn-reviews">
        Смотреть отзывы →
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useOrganizationStore } from '../stores/organization'

const auth = useAuthStore()
const store = useOrganizationStore()
const url = ref('')

async function handleSubmit() {
  await store.saveUrl(url.value)
}
</script>

<style scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 16px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h1 { margin: 0; font-size: 28px; }
.logout {
  background: none;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}
h2 { margin: 0 0 12px; font-size: 18px; }
.hint { color: #666; font-size: 14px; margin-bottom: 16px; }
code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  margin-bottom: 12px;
}
button {
  padding: 10px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #dc2626; margin-top: 12px; font-size: 14px; }
.stats {
  display: flex;
  gap: 24px;
  margin: 16px 0;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-value { font-size: 28px; font-weight: 700; color: #2563eb; }
.stat-label { font-size: 13px; color: #666; }
.btn-reviews {
  display: inline-block;
  margin-top: 8px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}
</style>