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
                        data-bs-content="Select the brand new playlists you want to add songs to. <br><br> <b>Tip:</b> You can create new playlists by clicking the <b>Add New Playlist(s)</b> button. These playlists will be auto-created in your Spotify account."
                        ><font-awesome-icon icon="fa-solid fa-circle-question" class="fa-lg" />
                    </span>
                    <h1 class="d-inline-block me-5">Select New Playlists</h1>
                    <p class="d-inline-block mt-3">{{ playlists_selected }}/ {{ curr_user_playlists.length }} selected</p>
                    <p class="mt-3 ms-3 error-msg" :class="show_error ? '' : 'opacity-0' ">
                        <span class="badge rounded-pill text-bg-danger py-2 px-3">No playlists added yet</span>
                    </p>
                </div>
    
                <button class="btn btn-warning" @click="addAll()">Add All</button>
                <button class="btn btn-danger ms-3" @click="removeAll()">Remove All</button>
                <button class="btn btn-secondary ms-3" @click="sortByName()">Sort by Name {{ curr_sort == 'name-desc' ? '^' : 'v' }}</button>
                <button class="btn btn-secondary ms-3" @click="sortBySelected()">Sort by Selected {{ curr_sort == 'selected-desc' ? '^' : 'v' }}</button>
                <button class="btn btn-secondary ms-3" @click="addNewPlaylists()">Add New Playlist(s)</button>
    
                <button class="btn btn-success ms-5" @click="saveNewPlToDb()">Continue ></button>
            </div>
        </div>
        
        <div class="container-fluid">
            <div v-if="curr_user_playlists.length > 0" class="row">
                <div v-for="(e_playlist, index) in curr_user_playlists" :key="index" class="col-12 col-md-6 col-lg-4">
                    <div class="card border-0 mb-3 pointer-hover card-styling position-relative" :class="e_playlist.to_add ? 'bg-selected text-white' : ''" @click="cardClicked(e_playlist)">
                        <div class="row g-0">
                            <div class="col-auto">
                                <img v-if="e_playlist.images.length > 0 " :src="e_playlist.images[0].url" class="rounded-start img-125">
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
                <h3>No empty playlists in your Spotify library.<br><br>Click "Add New Playlist(s)" above to get started.</h3>
            </div>
        </div>
    </div>

    <div class="modal fade" tabindex="-1" id="addPlaylistModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Playlists to Your Spotify Account</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div v-for="(e_new_pl, index2) in new_playlists" class="mb-5" :key="index2">
                        <div class="mb-3">
                            <h5 class="d-inline">Playlist {{ index2+1 }}</h5>
                            <span class="badge rounded-pill text-bg-secondary ms-3 del-button" @click="remove_playlist(index2)" :class="new_playlists.length>1 ? '': 'd-none'">Delete</span>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" :id="`name-${index2}`" placeholder="" v-model="e_new_pl.name">
                            <label :for="`name-${index2}`">Name</label>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" :id="`desc-${index2}`" placeholder="" v-model="e_new_pl.description">
                            <label :for="`desc-${index2}`">Description (optional)</label>
                        </div>

                    </div>

                    <button class="btn btn-warning" @click="add_playlist()">Add playlist</button>
                </div>

                <div class="modal-footer">
                    <span class="badge rounded-pill text-bg-danger py-2 px-3 add-pl-err me-auto" :class="add_pl_error_msg=='' ? 'opacity-0' : ''"> {{ add_pl_error_msg }} </span>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" @click="save_new_pl()">Save changes</button>
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
                curr_user_playlists: [],
                curr_sort: "",
                add_playlist_modal: null,
                add_pl_error_msg: "",
                error_msg: "",
                new_playlists: [
                    {
                        name: "",
                        description: "",
                    }
                ],
                show_error: false,
            };
        },
        computed: {
            playlists_selected() {
                var count = 0

                for (let key in this.curr_user_playlists) {
                    if (this.curr_user_playlists[key]["to_add"]) {
                        count++
                    }
                }

                return count
            },
        },
        methods: {
            addAll() {
                for (let key in this.curr_user_playlists) {
                    this.curr_user_playlists[key]["to_add"] = true;
                }
            },
            removeAll() {
                for (let key in this.curr_user_playlists) {
                    this.curr_user_playlists[key]["to_add"] = false;
                }
            },
            sortByName() {
                var sort_dir = 1

                if (this.curr_sort === "name-desc") {
                    sort_dir = -1
                    this.curr_sort = "name-asc"
                } else {
                    this.curr_sort = "name-desc"
                }

                this.curr_user_playlists.sort((a, b) => {
                    if (a.name < b.name) {
                        return -sort_dir
                    } else if (a.name > b.name) {
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

                this.curr_user_playlists.sort((a, b) => {
                    // Convert boolean values to numbers (true -> 1, false -> 0) for comparison
                    const aValue = a.to_add ? 0 : 1;
                    const bValue = b.to_add ? 0 : 1;

                    return (aValue - bValue) * sort_dir;
                })
            },
            cardClicked(e_playlist) {
                e_playlist.to_add = !e_playlist.to_add
            },
            addNewPlaylists() {
                this.add_playlist_modal.show()
            },
            add_playlist() {
                var new_pl = {
                    name: "",
                    description: "",
                }

                this.new_playlists.push(new_pl)
            },
            remove_playlist(index) {
                this.new_playlists.splice(index, 1)
            },
            async save_new_pl() {
                // Check if all new playlists have a name
                for (var i = 0; i < this.new_playlists.length; i++) {
                    var e_new_pl = this.new_playlists[i]

                    if (e_new_pl.name.trim() == "") {
                        this.add_pl_error_msg = "All new playlists must have a name!"

                        // Remove error message after 3 seconds
                        setTimeout(() => {
                            this.add_pl_error_msg = ""
                        }, 3000);

                        return
                    }
                }

                // Add new playlists to Spotify
                for (var i = 0; i < this.new_playlists.length; i++) {
                    var e_new_pl = this.new_playlists[i]

                    var res = await SpotifyApiUtils.createNewPlaylist(e_new_pl.name, e_new_pl.description)
                    this.curr_user_playlists.push(res)
                }

                this.add_playlist_modal.hide()
                this.new_playlists = [
                    {
                        name: "",
                        description: "",
                    }
                ]
            },
            async saveNewPlToDb() {
                var new_pl = []

                for (var i = 0; i < this.curr_user_playlists.length; i++) {
                    var e_playlist = this.curr_user_playlists[i]

                    if (e_playlist.to_add) {
                        new_pl.push(e_playlist)
                    }
                }

                // check if new_pl is empty
                if (new_pl.length == 0) {
                    this.show_error = true

                    // Remove error message after 3 seconds
                    setTimeout(() => {
                        this.show_error = false
                    }, 3000);
                    
                    return
                }

                await firebase.writeDb(`${localStorage.getItem('spotifyUserId')}/new_playlists`, new_pl)
                await firebase.writeDb(`${localStorage.getItem('spotifyUserId')}/sorted_songs`, '')
                this.$router.push('/app/sort')
            }
        },
        async mounted() {
            var temp_user_playlists = await SpotifyApiUtils.getAllPlaylists()
            await SpotifyApiUtils.getUserId()

            // Remove playlists that already have tracks added (aka only take playlists that are empty)
            for (var i = 0; i < temp_user_playlists.length; i++) {
                var playlist = temp_user_playlists[i]

                if (playlist.tracks.total == 0) {
                    playlist["to_add"] = false
                    this.curr_user_playlists.push(playlist)
                }
            }

            this.add_playlist_modal = new bootstrap.Modal(document.getElementById('addPlaylistModal'), {
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
    .del-button {
        cursor: pointer;
        transition: all 0.15s ease-in-out;
    }
    .add-pl-err {
        transition: all 1s ease-in-out;
    }
  </style>