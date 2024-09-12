<template>
  <div class="h-100 d-flex justify-content-center align-items-center">
      <h3 v-if="!error_msg"><font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin-pulse me-3" />Loading App, Hang Tight</h3>
      <h3 v-else>{{ error_msg }}</h3>
  </div>
</template>

<script>

import { SpotifyApiUtils } from '../js_methods/spotify_api'
import * as firebase from '../js_methods/firebase'

export default {
  data() {
    return {
      error_msg: null,
    };
  },
  async mounted() {
    this.error_msg = null

    // check if user is logged in to Firebase
    if (!await firebase.isUserLoggedIn()) {
      // If user not logged in, redirect to login page (seems like browser does not allow auto login with router.push)
      this.$router.push({ path: '/login' })
      return
    }

    // check if user is logged in to Spotify
    await SpotifyApiUtils.updateAccessToken()

    // check user data in firebase
    var user_data = await firebase.readAllAccountData();
    
    if (!user_data.hasOwnProperty('curr_playlists') || !user_data.hasOwnProperty('songs_selected')) {
      this.$router.push({ path: 'app/playlist_select' })
    } else if (!user_data.hasOwnProperty('new_playlists')) {
      this.$router.push({ path: 'app/playlist_create' })
    } else {
      this.$router.push({ path: 'app/sort' })
    }

    this.error_msg = 'Error in loading app. Please try refreshing page.'
  }
};
</script>