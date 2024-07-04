<template>
    <div class="main px-4 py-2">
        <div class="sticky-top">
            <div class="bg-light-green p-2"></div>
            <div class="p-3 mb-3 mx-2 rounded-4 bg-dark-green text-white">
                <div class="d-flex align-self-start mb-2">
                    <span 
                        class="me-3 ms-2 d-flex align-items-center pb-2"
                        data-bs-toggle="popover"
                        data-bs-trigger="hover"
                        data-bs-html="true"
                        data-bs-content="Select the playlists that contain the songs you want to organize.<br/><br/>Don't worry about duplicate songs, we'll take care of that for you."
                        ><font-awesome-icon icon="fa-solid fa-circle-question" class="fa-lg" />
                    </span>
                    <h1 class="d-inline-block me-5">
                        Song Selection
                    </h1>
                    <p class="d-inline-block mt-3">{{ playlists_selected }}/ {{ user_playlists.length }} selected</p>
                    <p class="mt-3 ms-3 error-msg" :class="show_error ? '' : 'opacity-0' ">
                        <span class="badge rounded-pill text-bg-danger py-2 px-3">No playlists added yet</span>
                    </p>
                </div>
    
                <button class="btn btn-warning" @click="addAll()">Add All</button>
                <button class="btn btn-danger ms-3" @click="removeAll()">Remove All</button>
                <button class="btn btn-secondary ms-3" @click="sortByName()">Sort by Name {{ curr_sort == 'name-desc' ? '^' : 'v' }}</button>
                <button class="btn btn-secondary ms-3" @click="sortByNumSongs()">Sort by No. Songs {{ curr_sort == 'num-song-desc' ? '^' : 'v' }}</button>
                <button class="btn btn-secondary ms-3" @click="sortBySelected()">Sort by Selected {{ curr_sort == 'selected-desc' ? '^' : 'v' }}</button>
    
                <button class="btn btn-success ms-5" @click="pushToFirebase()">Continue ></button>
            </div>
        </div>
        
        <div class="container-fluid">
            <div class="row" v-if="user_playlists.length > 0">
                <div v-for="(e_playlist, index) in user_playlists" :key="index" class="col-12 col-md-6 col-lg-4">
                    <div class="card border-0 mb-3 pointer-hover card-styling position-relative" :class="e_playlist.to_add ? 'bg-selected text-white' : ''" @click="cardClicked(e_playlist)">
                        <div class="row g-0">
                            <div class="col-auto">
                                <img v-if="e_playlist.images !== null && e_playlist.images.length > 0" :src="e_playlist.images[0].url" class="rounded-start img-125">
                                <img v-else src="https://placehold.co/125x125?text=No+Img" class="rounded-start">
                            </div>
            
                            <div class="col">
                                <div class="card-body">
                                    <h3 class="card-title truncate-two-lines text-break">{{ index + 1 }} - {{ e_playlist.name }}</h3>
                                    <p class="card-text">No. songs: {{ e_playlist.tracks.total }}</p>
                                    
                                    <img src="../assets/checked.png" width="20px" class="position-absolute top-0 end-0 m-2" v-if="e_playlist.to_add">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="row text-center py-5">
                <h3>No playlists in your Spotify library.<br><br>Seems like you have no songs to organize...</h3>
            </div>
        </div>
    </div>

    <div class="modal fade" tabindex="-1" id="loadingModal" data-bs-backdrop="static">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin-pulse me-2" />Adding Your Songs</h5>
                </div>

                <div class="modal-body">
                    <p>Songs Added {{ tracks_added }} / {{ num_tracks_to_add }}</p>

                    <div class="progress" role="progressbar" :aria-valuenow="percentage_complete" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar bg-success" :style="{ width: percentage_complete + '%' }">{{ percentage_complete }}%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>
    import { SpotifyApiUtils } from '../js_methods/spotify_api'
    import * as firebase from '../js_methods/firebase'
    import * as bootstrap from 'bootstrap'
  
    export default {
        data() {
            return {
                user_playlists: [],
                curr_sort: "",
                num_tracks_to_add: 0,
                tracks_added: 0,
                show_error: false,
                my_modal: null,
            };
        },
        computed: {
            playlists_selected() {
                return this.user_playlists.filter(obj => obj.to_add === true).length
            },
            percentage_complete() {
                if (this.tracks_added == 0) {
                    return 0
                }

                return Math.ceil(this.tracks_added / this.num_tracks_to_add * 100)
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
            cardClicked(e_playlist) {
                if (e_playlist.to_add) {
                    this.num_tracks_to_add -= e_playlist.tracks.total
                } else {
                    this.num_tracks_to_add += e_playlist.tracks.total
                }

                e_playlist.to_add = !e_playlist.to_add
            },
            showLoadingModal(to_show=true) {
                if (!to_show) {
                    this.myModal.hide()
                } else {
                    // Go thorugh all selected playlists and update total number of tracks to add
                    this.num_tracks_to_add = this.user_playlists
                        .filter(obj => obj.to_add === true)
                        .map(obj => obj.tracks.total)
                        .reduce((acc, val) => acc + val, 0)

                    this.myModal.show()
                }
            },
            async pushToFirebase() {
                if (this.playlists_selected == 0) {
                    this.show_error = true

                    // Set a timeout to turn off the error after 3 seconds
                    setTimeout(() => {
                        this.show_error = false;
                    }, 3000);

                    return
                }

                this.showLoadingModal()

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

                // process each playlist's tracks to db
                for (let pl_id in playlists_to_add) {
                    var e_pl = playlists_to_add[pl_id]
                    var num_tracks = e_pl.tracks.total
                    var num_tracks_processed = 0

                    while (num_tracks_processed < num_tracks) {
                        var num_curr_processed = await SpotifyApiUtils.getPlaylistTracksAndPushToDb(pl_id, 50, num_tracks_processed)
                        num_tracks_processed += num_curr_processed
                        this.tracks_added += num_curr_processed
                    }
                }

                // Redirect to the playlist create page after 1.5 seconds
                setTimeout(() => {
                    this.showLoadingModal(false)
                    this.$router.push('/app/playlist_create')
                }, 1500);
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
        },
        async mounted() {
            var temp_user_playlists = await SpotifyApiUtils.getAllPlaylists()

            // Filter out playlists with 0 songs
            this.user_playlists = temp_user_playlists.filter(obj => obj.tracks.total > 0)

            await SpotifyApiUtils.getUserId()

            for (let key in this.user_playlists) {
                this.user_playlists[key]["to_add"] = false;
            }

            this.myModal = new bootstrap.Modal(document.getElementById('loadingModal'), {
                keyboard: false
            })
        }
    };
  </script>
  
  <style scoped>
    .bg-selected {
        background-color: #278049;
    }
    .bg-dark-green {
        background-image: linear-gradient(to bottom, #06BE4B, #06be4ddb, #abebc400);
    }
    .bg-light-green {
        background-color: #c6ffdc;
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
    .error-msg {
        transition: all 0.15s ease-in-out;
    }
  </style>