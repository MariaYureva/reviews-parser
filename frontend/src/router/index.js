import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SettingsView from '../views/SettingsView.vue'
import ReviewsView from '../views/ReviewsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/settings',
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/reviews/:id',
      component: ReviewsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/settings'
})

export default router