<template>
    <div class="main">
        <div class="sticky-top p-3 my-3 mx-2 rounded-4 bg-dark-green text-white">
            <div class="d-flex align-self-start mb-2">
                <h1 class="d-inline-block me-5">Playlist Selection</h1>
                <p class="d-inline-block mt-2">{{ playlists_selected }}/ {{ user_playlists.length }} selected</p>
            </div>

            <button class="btn btn-warning" @click="addAll()">Add All</button>
            <button class="btn btn-danger ms-3" @click="removeAll()">Remove All</button>
            <button class="btn btn-secondary ms-3" @click="sortByName()">Sort by Name {{ curr_sort == 'name-desc' ? '^' : 'v' }}</button>
            <button class="btn btn-secondary ms-3" @click="sortByNumSongs()">Sort by No. Songs {{ curr_sort == 'num-song-desc' ? '^' : 'v' }}</button>
            <button class="btn btn-secondary ms-3" @click="sortBySelected()">Sort by Selected {{ curr_sort == 'selected-desc' ? '^' : 'v' }}</button>

            <button class="btn btn-secondary ms-5" @click="pushToFirebase()">Continue</button>
            <button class="btn btn-primary ms-3" @click="testfunc()">Get all songs</button>
        </div>
        
        <div class="container-fluid">
            <div class="row">
                <div v-for="(e_playlist, index) in user_playlists" :key="index" class="col-12 col-md-6 col-lg-4">
                    <div class="card border-0 mb-3 pointer-hover card-styling position-relative" :class="e_playlist.to_add ? 'bg-light-green text-white' : ''" @click="e_playlist.to_add = !e_playlist.to_add">
                        <div class="row g-0">
                            <div class="col-auto">
                                <img v-if="e_playlist.images.length > 0 " :src="e_playlist.images[0].url" class="rounded-start img-125">
                                <img v-else src="https://placehold.co/125x125?text=No+Img" class="rounded-start">
                            </div>
            
                            <div class="col">
                                <div class="card-body">
                                    <h3 class="card-title truncate-two-lines">{{ index + 1 }} - {{ e_playlist.name }}</h3>
                                    <p class="card-text">No. songs: {{ e_playlist.tracks.total }}</p>
                                    
                                    <img src="../assets/checked.png" width="20px" class="position-absolute top-0 end-0 m-2" v-if="e_playlist.to_add">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>
    import { SpotifyApiUtils } from '../js_methods/spotify_api'
    import * as firebase from '../js_methods/firebase'
  
    export default {
        data() {
            return {
                user_playlists: [],
                curr_sort: "",
            };
        },
        computed: {
            playlists_selected() {
                return this.user_playlists.filter(obj => obj.to_add === true).length
            }
        },
        methods: {
            addAll() {
                for (let key in this.user_playlists) {
                    this.user_playlists[key]["to_add"] = true;
                }
            },
            removeAll() {
                for (let key in this.user_playlists) {
                    this.user_playlists[key]["to_add"] = false;
                }
            },
            async pushToFirebase() {
                let playlists_to_add = this.user_playlists
                .filter(obj => obj.to_add === true)
                .map(obj => {
                    let newObj = { ...obj };
                    
                    // Remove the "to_add" key
                    delete newObj.to_add;

                    // Set id as the key
                    return { [newObj.id]: newObj };
                })
                .reduce((acc, obj) => ({ ...acc, ...obj }), {}); // Merge objects into a single object

                await firebase.writeDb(`${localStorage.getItem('spotifyUserId')}/curr_playlists`, playlists_to_add)
            },
            sortByName() {
                var sort_dir = 1

                if (this.curr_sort === "name-desc") {
                    sort_dir = -1
                    this.curr_sort = "name-asc"
                } else {
                    this.curr_sort = "name-desc"
                }

                this.user_playlists.sort((a, b) => {
                    if (a.name < b.name) {
                        return -sort_dir
                    } else if (a.name > b.name) {
                        return sort_dir
                    } else {
                        return 0
                    }
                })
            },
            sortByNumSongs() {
                var sort_dir = 1

                if (this.curr_sort === "num-song-desc") {
                    sort_dir = -1
                    this.curr_sort = "num-song-asc"
                } else {
                    this.curr_sort = "num-song-desc"
                }

                this.user_playlists.sort((a, b) => {
                    if (a.tracks.total > b.tracks.total) {
                        return -sort_dir
                    } else if (a.tracks.total < b.tracks.total) {
                        return sort_dir
                    } else {
                        return 0
                    }
                })
            },
            sortBySelected() {
                var sort_dir = 1

                if (this.curr_sort === "selected-desc") {
                    sort_dir = -1
                    this.curr_sort = "selected-asc"
                } else {
                    this.curr_sort = "selected-desc"
                }

                this.user_playlists.sort((a, b) => {
                    // Convert boolean values to numbers (true -> 1, false -> 0) for comparison
                    const aValue = a.to_add ? 0 : 1;
                    const bValue = b.to_add ? 0 : 1;

                    return (aValue - bValue) * sort_dir;
                })
            },
            testfunc() {
                let playlists_to_add = this.user_playlists
                .filter(obj => obj.to_add === true)

                for (let key in playlists_to_add) {
                    let playlist = playlists_to_add[key]
                    let playlist_id = playlist.id

                    SpotifyApiUtils.getAllPlaylistTracks(playlist_id)
                }
            }
        },
        async mounted() {
            this.user_playlists = await SpotifyApiUtils.getAllPlaylists()

            for (let key in this.user_playlists) {
                this.user_playlists[key]["to_add"] = false;
            }
        }
    };
  </script>
  
  <style scoped>
    .bg-light-green {
        background-color: #278049;
    }
    .bg-dark-green {
        background-image: linear-gradient(to bottom, #268049, #3faf6aef, #abebc373);
    }
    .img-125 {
        width: 125px;
        height: 125px;
        object-fit: cover;
    }
    .pointer-hover {
        cursor: pointer;
    }
    .card-styling {
        height: 125px;
        min-width: 1px;
        transition: all 0.2s ease-in-out;
    }
    .card-styling:hover {
        box-shadow: 4px 4px 12px #088538;
    }
    .truncate-two-lines {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        text-overflow: ellipsis;
    }
  </style>