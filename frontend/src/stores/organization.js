import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useOrganizationStore = defineStore('organization', () => {
    const organization = ref(null)
    const reviews = ref([])
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)
    const loading = ref(false)
    const error = ref(null)

    async function saveUrl(url) {
        loading.value = true
        error.value = null
        try {
            const response = await api.post('/organizations', { yandex_url: url })
            organization.value = response.data
            await fetchReviews(response.data.id, 1)
        } catch (e) {
            error.value = e.response?.data?.message ?? 'Ошибка при сохранении'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function fetchReviews(orgId, page = 1) {
        loading.value = true
        try {
            const response = await api.get(`/organizations/${orgId}/reviews?page=${page}`)
            reviews.value = response.data.data
            currentPage.value = response.data.current_page
            lastPage.value = response.data.last_page
            total.value = response.data.total
        } catch (e) {
            error.value = e.response?.data?.message ?? 'Ошибка загрузки отзывов'
        } finally {
            loading.value = false
        }
    }

    return { organization, reviews, currentPage, lastPage, total, loading, error, saveUrl, fetchReviews }
})