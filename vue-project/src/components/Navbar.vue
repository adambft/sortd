<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav class="navbar">
        <div class="navbar-brand">
            <img class="logo" src="../assets/adambft_design_logo_white.svg" width="200" />
        </div>

        <div class="navbar-menu">
            <div class="navbar-start">
                <RouterLink to="/" class="navbar-item">Home</RouterLink>
                <RouterLink to="/app" class="navbar-item">App</RouterLink>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'Navbar',
}
</script>

<style scoped>
.navbar {
    background-color: #06BE4B;
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
    color: #096029;
}

.router-link-active {
    color: #096029;
}

</style>
