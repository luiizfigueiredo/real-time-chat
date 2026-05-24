import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const guestOnlyRoutes = new Set(['login', 'register', 'forgot-password', 'forgot-password-sent', 'reset-password'])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/',
      component: () => import('@/views/auth/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/SignInView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/SignUpView.vue'),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotView.vue'),
        },
        {
          path: 'forgot-password/sent',
          name: 'forgot-password-sent',
          component: () => import('@/views/auth/ForgotSentView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetView.vue'),
        },
      ],
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/chat/ChatView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (authStore.isAuthenticated && to.name && guestOnlyRoutes.has(String(to.name))) {
    return { name: 'chat' }
  }
})

export default router
