<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div id="all-content">
    <Navbar id="navbar" v-if="showNavbar" />
  
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>


<script>
  export default {
    computed: {
      showNavbar() {
        // Hides the navbar on the certain pages
        const noNavbarRoutes = ['/login']; // <-- Add more routes here
        return !noNavbarRoutes.includes(this.$route.path);
      }
    }
  }
</script>


<style scoped>
#all-content {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

#navbar {
  flex: 0 0 1px;
}

.main-content {
  flex: 1 0 1px;
  overflow-y: scroll;
  background-color: #c6ffdc;
}
</style>
