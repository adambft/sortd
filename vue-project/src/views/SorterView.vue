<template>
  <div class="main">
    <div>
      <h1>Welcome to The Actual Fucking App</h1>
      <p>{{ testparam }}</p>
    </div>
  </div>
</template>

<script>

import { SpotifyApiUtils } from '../js_methods/spotify_api'

export default {
  data() {
    return {
      testparam: "",
    };
  },
  async mounted() {
    this.testparam = await SpotifyApiUtils.getAccessToken()
  }
};
</script>

<style scoped>
.main {
  padding: 1.2rem;
  background-color: #c6ffdc;
}
</style>
