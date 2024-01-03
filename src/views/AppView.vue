<template>
  <div class="main">
    <div>
      <h1>Welcome to The App</h1>
      <p>{{ local_storage_shit }}</p>
      <button @click="getplaylists" class="btn btn-warning">Get All Playlists</button>
      <button @click="getspotifyid" class="btn btn-warning">Get Spotify ID</button>
      <button @click="this.$router.push({ path: '/app/playlist_select' })" class="btn btn-warning">Go to Song Selection</button>
    </div>
  </div>
</template>

<script>

import { SpotifyApiUtils } from '../js_methods/spotify_api'
import * as firebase from '../js_methods/firebase'

export default {
  data() {
    return {
      local_storage_shit: "",
    };
  },
  methods: {
    async getplaylists() {
      SpotifyApiUtils.getAllPlaylists()
    },

    async getspotifyid() {

    }
  },
  async mounted() {
    this.local_storage_shit = JSON.stringify(localStorage);

    await SpotifyApiUtils.updateAccessToken()
  }
};
</script>

<style scoped>
.main {
  padding: 1.2rem;
  background-color: #c6ffdc;
}
</style>
