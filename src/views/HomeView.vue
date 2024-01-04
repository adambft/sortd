<template>
  <div class="main">
    <div>
      <h1>Welcome to Adambft's Spotify Playlist Sorter-inator</h1>
      <p>The BEST Spotify Playlist Organizer in the Entire Tristate Area</p>
      <hr>
      <p>{{ local_storage_shit }}</p>
    </div>
  </div>
</template>

<script>
  import * as firebase from '../js_methods/firebase'

  export default {
    data() {
      return {
        local_storage_shit: "",
      };
    },
    async mounted() {
      this.local_storage_shit = JSON.stringify(localStorage);
    }
  };
</script>

<style scoped>
  .main {
    padding: 1.2rem;
    background-color: #c6ffdc;
  }
</style>