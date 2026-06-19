import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'))
    const user = ref(null)

    async function login(email, password) {
        const response = await api.post('/login', { email, password })
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', token.value)
    }

    function logout() {
        api.post('/logout').finally(() => {
            token.value = null
            user.value = null
            localStorage.removeItem('token')
            window.location.href = '/login'
        })
    }

    function isAuthenticated() {
        return !!token.value
    }

    return { token, user, login, logout, isAuthenticated }
})