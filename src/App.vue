<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div id="all-content">
    <Navbar />
  
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
#all-content {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

#all-content :first-child {
  flex: 0 0 1px;
}
.main-content {
  flex: 1 0 1px;
  overflow-y: scroll;
}
</style>
