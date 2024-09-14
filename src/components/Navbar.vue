<script setup>
import { SpotifyApiUtils } from '@/js_methods/spotify_api';
import { RouterLink } from 'vue-router'
import * as firebase from '../js_methods/firebase';
</script>

<template>
    <nav class="navbar navbar-expand-lg bg-success">
        <div class="container-fluid">
            <a class="navbar-brand p-0">
                <RouterLink to="/" class="navbar-item m-0">
                    <img class="logo py-1 pe-5 pe-md-0" src="../assets/logos/Main Logo/SVG/main_logo_color_light.svg" width="200" />
                </RouterLink>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item lh-lg">
                        <RouterLink to="/" class="navbar-item">Home</RouterLink>
                    </li>

                    <li class="nav-item lh-lg">
                        <RouterLink to="/app" class="navbar-item" :class="{ 'router-link-active': $route.path.startsWith('/app') }">App</RouterLink>
                    </li>

                    <li class="nav-item dropdown" v-if="userLoggedIn">
                        <a class="nav-link" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <font-awesome-icon icon="fa-solid fa-circle-user" class="text-white fa-xl" />
                        </a>

                        <ul class="dropdown-menu dropdown-menu-end border-0">
                            <li><RouterLink to="/account" class="dropdown-item">Account</RouterLink></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" @click="logUserOut()">Log Out</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'Navbar',
    data() {
        return {

        }
    },
    computed: {
        userLoggedIn() {
            if (!firebase.isUserLoggedIn()) {
                return false
            } else if (!localStorage.getItem('accessToken')) {
                return false
            } else {
                return true
            }
        },
    },
    methods: {
        async logUserOut() {
            SpotifyApiUtils.logout();
            await firebase.logout();
            
            this.$router.push({ path: '/' })
            
            // Reload needed to update userLoggedIn computed property
            location.reload();
        },
    }
}
</script>

<style scoped>
.navbar {
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
}

.navbar-item {
    margin-right: 1rem;
    text-decoration: none;
    font-weight: 700;
    color: #ffffff;
    font-size: 1.2rem;
    transition: all 0.2s ease-in-out;
}

.navbar-item:hover {
    color: #023013;
}

.router-link-active {
    color: #023013;
}

</style>
