<template>
  <div class="container-fluid pb-5 px-0">
    <div class="row" id="main-top-part">
      <div class="col-5 p-0">
        <img src="../assets/home_title_img.jpg" id="title-img">
      </div>
      <div class="col-7 px-4 d-flex flex-column justify-content-center bg-trans">
        <h1>"I should probably organise my Spotify playlists"</h1>
        <p class="mt-4">How many times have you said that to yourself over the past 500 years but never actually got to it cos you're a lazy goddamn piece of sh.?</p>
        <p>Well, now you can find your motivation with our patented* Spotify playlist organiser technology.</p>
        <small class="text-sm mt-5 fst-italic text-secondary">*Not actually patented</small>
      </div>
    </div>

    <div class="row mt-5">
      <h3 class="text-center">Get your playlists sorted in 4 easy steps</h3>
    </div>

    <div class="row d-flex justify-content-center align-items-center mt-4">
      <div class="card rounded-3 text-center border-0" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Step 1</h5>
          <p class="card-text"><font-awesome-icon icon="fa-solid fa-music" class="me-2" />Pick your songs to sort</p>
        </div>
      </div>

      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-auto" />

      <div class="card rounded-3 text-center border-0" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Step 2</h5>
          <p class="card-text"><font-awesome-icon icon="fa-solid fa-list-ul" class="me-2" />Select your new playlists</p>
        </div>
      </div>

      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-auto" />

      <div class="card rounded-3 text-center border-0" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Step 3</h5>
          <p class="card-text"><font-awesome-icon icon="fa-solid fa-hand-pointer" class="me-2" />Start sorting</p>
        </div>
      </div>

      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-auto" />

      <div class="card rounded-3 text-center border-0" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">Step 4</h5>
          <p class="card-text"><font-awesome-icon icon="fa-brands fa-spotify" class="me-2" />Export to Spotify</p>
        </div>
      </div>
    </div>

    <div class="row justify-content-center bg-trans mt-5 py-3">
      <h3 class="text-center">What are you waiting for?</h3>

      <div class="w-auto">
        <button class="btn btn-success mt-3 fw-bold" @click="goToApp()">Click here to get started now!</button>
      </div>
    </div>
  </div>
</template>

<script>
  import * as firebase from '../js_methods/firebase'

  export default {
    data() {
      return {
      };
    },
    async mounted() {
    },
    methods: {
      goToApp() {
        this.$router.push('/app')
      }
    }
  };
</script>

<style scoped>
  #main-top-part {
    height: 500px;
  }

  #title-img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .bg-trans {
    background-color: #ffffff70;
  }
</style>