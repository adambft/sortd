import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppView from '../views/AppView.vue'
import AccountAuthorizeView from '../views/AuthorizationEndpointView.vue'
import PlaylistSelectView from '../views/PlaylistSelectView.vue'
import PlaylistCreateView from '../views/PlaylistCreateView.vue'
import SorterView from '../views/SorterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/app',
      name: 'app',
      component: AppView,
    },
    {
      path: '/account_authorize',
      name: 'account_authorize',
      component: AccountAuthorizeView,
    },
    {
      path: '/app/playlist_select',
      name: 'playlist_select',
      component: PlaylistSelectView,
    },
    {
      path: '/app/playlist_create',
      name: 'playlist_create',
      component: PlaylistCreateView,
    },
    {
      path: '/app/sort',
      name: 'sorter',
      component: SorterView,
    },
  ]
})

export default router
