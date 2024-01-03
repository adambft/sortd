<template>
    <h1>Authorization Page</h1>
    <hr>
    <p>{{ local_storage_shit }}</p>
    <hr>
    <p>{{ error_msg }}</p>
</template>


<script>
import { SpotifyApiUtils } from '../js_methods/spotify_api'

export default {
    data() {
        return {
            local_storage_shit: "",
            error_msg: "",
        };
    },

    async mounted() {
        this.local_storage_shit = JSON.stringify(localStorage);

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


<style scoped>

</style>