<template>
    <button class="btn btn-danger" @click="del_account">Delete my account</button>
</template>

<script>
import * as firebase from '../js_methods/firebase'

export default {
    methods: {
        async del_account() {
            await firebase.deleteAllSpotifyAccountData();

            localStorage.removeItem('awaiting_access_token_update');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('scope');
            localStorage.removeItem('accessTokenTime');
            localStorage.removeItem('codeVerifier');
            localStorage.removeItem('spotifyUserId');

            localStorage.setItem('userLoggedOut', true)
            this.$router.push({ path: '/' })
        },
    }
}
</script>

<style scoped>
/* Your CSS code goes here */
</style>
