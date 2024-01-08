<template>
      <div class="h-100 d-flex justify-content-center align-items-center">
      <h3><font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin-pulse me-3" />Authorizing access</h3>
  </div>
</template>


<script>
import { SpotifyApiUtils } from '../js_methods/spotify_api'

export default {
    async mounted() {
        try {
            var authCode = SpotifyApiUtils.getUrlAuthCode()
    
            if (!authCode) {
                // redirect to home if not redirected from Spotify authorization page
                this.$router.push({ path: '/' })
            }
        } catch (error) {
            this.$router.push({ path: '/' })
        }

        await SpotifyApiUtils.continueUpdateAccessToken(authCode)

        this.$router.push({ path: '/app' })
    }
};
</script>