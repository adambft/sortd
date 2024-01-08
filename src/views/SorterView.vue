<template>
    <div class="container-fluid h-100">
        <div class="row p-3 pb-2">
            <div class="progress rounded-5 p-0 bg-progress-custom position-relative" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" style="height: 20px">
                <div class="position-absolute w-100 text-center" v-if="perc_songs_sorted < 10">{{ num_songs_sorted }}/{{ total_num_songs }} Songs Sorted</div>
                <div class="progress-bar bg-success" :style="{width: `${perc_songs_sorted}%`}">{{ perc_songs_sorted >= 10 ? `${num_songs_sorted }/${ total_num_songs } Songs Sorted` : `` }}</div>
            </div>
        </div>

        <div class="row h-100">
            <div class="col-6">
                <div class="sticky-top pt-3">
                    <div :class="curr_track==null ? 'd-none' : ''" class="text-start">
                        <div class="mb-3">
                            <div id="embed-iframe"></div>
                        </div>
                        
                        <span class="badge rounded-pill text-bg-success py-2 px-3 me-2 mb-3" v-for="(e_genre, index3) in all_spotify_genres" :key="index3">
                            {{ e_genre }}
                        </span>
    
                        <br>
    
                        <span class="badge rounded-pill text-bg-primary py-2 px-3 me-2 mb-3" v-for="(e_genre_data, index4) in all_lastfm_genres" :key="index4">
                            {{ e_genre_data.name }}
                        </span>
                    </div>

                    <div :class="curr_track==null ? '' : 'd-none'" class="d-flex justify-content-center align-items-center mt-5 pt-5">
                        <div class="w-100">
                            <font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin-pulse fa-4x text-success w-100" />
                            <h3 class="text-center mt-4 text-success">Loading song</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-6 padding-lg">
                <div v-for="(e_playlist, index2) in user_playlists" :key="index2">
                    <div class="card card-styling mt-3 border-0" :class="e_playlist.to_add ? 'bg-selected text-white' : '' " @click="e_playlist.to_add = !e_playlist.to_add">
                        <div class="row g-0">
                            <div class="col-auto">
                                <img v-if="e_playlist.images != null && e_playlist.images.length > 0 " :src="e_playlist.images[0].url" class="rounded-start img-75">
                                <img v-else src="https://placehold.co/75x75?text=No+Img" class="rounded-start">
                            </div>

                            <div class="col d-flex align-items-center ps-3">
                                <h4 class="text-break truncate-two-lines">{{ e_playlist.name }}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-center">
                    <button class="btn btn-secondary btn-sm mt-4 fw-bold rounded-5 px-3" @click="openDelConfirmationModal()">Not my jam anymore</button>
                </div>

                <button class="btn btn-success btn-lg m-5 btn-stay-there" @click="checkPlaylistBeforeSave()">Save</button>
                <button class="btn btn-secondary btn-lg m-5 btn-stay-there-2" @click="loadPrevTrack()" v-if="prev_track_id">Go Back</button>
            </div>
        </div>

        <div class="modal" tabindex="-1" id="delModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm this is no longer your jam?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div class="modal-body">
                        <p><b>{{ curr_track ? curr_track.name : 'This song' }}</b> will NOT be added to any of your new playlists.</p>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete()" data-bs-dismiss="modal">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { SpotifyApiUtils } from '../js_methods/spotify_api'
import { LastFmApiUtils } from '../js_methods/lastfm_api'
import * as firebase from '../js_methods/firebase'
import * as bootstrap from 'bootstrap'

export default {
    data() {
        return {
            user_playlists: [],
            curr_track: null,
            artists_info: null,
            all_lastfm_genres: null,
            songs_to_sort: {},
            del_modal: null,
            prev_track_id: null,
            total_num_songs: 0,
            num_songs_sorted: 0,
        };
    },
    computed: {
        first_artist() {
            return this.curr_track.artists[0].name
        },
        all_artists() {
            if (this.curr_track === null) {
                return ""
            }

            var all_artists = ""

            for (let i = 0; i < this.curr_track.artists.length; i++) {
                let e_artist = this.curr_track.artists[i]
                all_artists += e_artist.name + ", "
            }
            return all_artists.slice(0, -2)
        },
        all_artists_id_csv() {
            if (this.curr_track === null) {
                return ""
            }

            var all_artists = ""

            for (let i = 0; i < this.curr_track.artists.length; i++) {
                let e_artist = this.curr_track.artists[i]
                all_artists += e_artist.id + ","
            }
            return all_artists.slice(0, -1)
        },
        all_spotify_genres() {
            if (this.artists_info === null) {
                return []
            }

            var all_genres = new Set()

            for (let i = 0; i < this.artists_info.length; i++) {
                let e_generes = this.artists_info[i].genres
                
                for (let j = 0; j < e_generes.length; j++) {
                    let e_genre = e_generes[j]

                    all_genres.add(e_genre.toLowerCase())
                }
            }
            
            return [...all_genres]
        },
        perc_songs_sorted() {
            if (this.total_num_songs === 0) {
                return 0
            }

            return Math.round((this.num_songs_sorted / this.total_num_songs) * 100)
        }
    },
    methods: {
        async loadNewTrack(track_id) {
            this.curr_track = await SpotifyApiUtils.getOneTrack(track_id)
            this.artists_info = await SpotifyApiUtils.getArtists(this.all_artists_id_csv)
            this.all_lastfm_genres = await LastFmApiUtils.getTrackTags(this.first_artist, this.curr_track.name, 10)
        },
        async updateSongsToSort(limit=50) {
            var all_user_songs = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/songs_selected`)
            var sorted_songs = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/sorted_songs`)

            
            if (sorted_songs === "" || sorted_songs === null) {
                sorted_songs = {}
            }

            this.total_num_songs = Object.keys(all_user_songs).length
            this.num_songs_sorted = Object.keys(sorted_songs).length

            for (let song_id in all_user_songs) {
                let e_song = all_user_songs[song_id]

                if (sorted_songs.hasOwnProperty(song_id)) {
                    //check if all playlists accounted for already
                    for (let e_pl_id in this.user_playlists) {
                        let e_new_pl_id = this.user_playlists[e_pl_id].id

                        if (sorted_songs[song_id].hasOwnProperty(e_new_pl_id)) {
                            continue
                        } else {
                            e_song['id'] = song_id
                            this.songs_to_sort[song_id] = e_song
                            break
                        }
                    }
                    continue
                }

                e_song['id'] = song_id
                this.songs_to_sort[song_id] = e_song

                if (Object.keys(this.songs_to_sort).length >= limit) {
                    break
                }
            }

            // if all songs are sorted
            if (Object.keys(this.songs_to_sort).length === 0) {
                alert('All songs sorted!')
            }
        },
        async loadRandomTrack() {
            this.curr_track = null

            var all_song_ids = Object.keys(this.songs_to_sort)
            var random_song_id = all_song_ids[Math.floor(Math.random() * all_song_ids.length)]

            await this.loadNewTrack(random_song_id)
            return
        },
        async saveSelection() {
            // saves sorting selection to firebase
            this.prev_track_id = this.curr_track.id

            var song_id_to_push = this.curr_track.id
            
            var song_data

            if (this.songs_to_sort.hasOwnProperty(song_id_to_push)) {
                song_data = this.songs_to_sort[song_id_to_push]
            } else {
                song_data = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/songs_selected/${song_id_to_push}`)
            }

            for (let i = 0; i < this.user_playlists.length; i++) {
                let e_playlist = this.user_playlists[i]
                let e_pl_id = e_playlist.id

                song_data[e_pl_id] = e_playlist.to_add
            }

            let spotify_tags = this.all_spotify_genres
            let lastfm_tags = []

            for (let i = 0; i < this.all_lastfm_genres.length; i++) {
                let e_tag = this.all_lastfm_genres[i]
                let e_tag_name = e_tag.name

                lastfm_tags.push(e_tag_name)
            }

            song_data['spotify_tags'] = spotify_tags
            song_data['lastfm_tags'] = lastfm_tags

            // push to firebase
            firebase.writeDb(`${localStorage.getItem('spotifyUserId')}/sorted_songs/${this.curr_track.id}`, song_data)
            this.num_songs_sorted += 1

            // remove from songs_to_sort
            delete this.songs_to_sort[this.curr_track.id]

            // check if any songs left
            if (Object.keys(this.songs_to_sort).length === 0) {
                await this.updateSongsToSort(50)
            }

            // load new track
            await this.loadRandomTrack()

            // Load the new track URI
            window.EmbedController.loadUri(`spotify:track:${this.curr_track.id}`);

            // reset playlist selection
            this.resetPlaylistSelection();

            window.EmbedController.play();
        },
        async confirmDelete() {
            // Clears any selection and pushes to db
            this.resetPlaylistSelection()
            await this.saveSelection()
        },
        resetPlaylistSelection() {
            for (let i = 0; i < this.user_playlists.length; i++) {
                let e_playlist = this.user_playlists[i]
                e_playlist.to_add = false
            }
        },
        openDelConfirmationModal() {
            // Check if user really doesnt want this song added
            this.del_modal.show()
        },
        async checkPlaylistBeforeSave () {
            // check if any playlist is selected
            for (let i = 0; i < this.user_playlists.length; i++) {
                let e_playlist = this.user_playlists[i]
                
                if (e_playlist.to_add) {
                    this.saveSelection()
                    return
                }
            }

            this.openDelConfirmationModal()
            return
        },
        async loadPrevTrack() {
            // load previous track
            await this.loadNewTrack(this.prev_track_id)

            this.num_songs_sorted -= 1

            // Load the new track URI
            window.EmbedController.loadUri(`spotify:track:${this.curr_track.id}`);

            // reset playlist selection
            this.resetPlaylistSelection();

            window.EmbedController.play();

            // get prev sorted data and show selected playlists
            var prev_sorted_data = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/sorted_songs/${this.curr_track.id}`)

            for (let i = 0; i < this.user_playlists.length; i++) {
                let e_playlist = this.user_playlists[i]
                let e_pl_id = e_playlist.id

                if (prev_sorted_data.hasOwnProperty(e_pl_id)) {
                    e_playlist.to_add = prev_sorted_data[e_pl_id]
                }
            }

            this.prev_track_id = null
        }
    },
    async mounted() {
        if (window.onSpotifyIframeApiReady) {
            window.location.reload();
        }

        this.del_modal = new bootstrap.Modal(document.getElementById('delModal'), {
            keyboard: false
        })

        await SpotifyApiUtils.getUserId()
        var get_temp_playlists = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/new_playlists`)

        // go through user_playlists and get the playlist data from spotify
        for (let i = 0; i < get_temp_playlists.length; i++) {
            let e_playlist = get_temp_playlists[i]
            let playlist_data = await SpotifyApiUtils.getOnePlaylist(e_playlist.id)

            playlist_data['to_add'] = false
            
            this.user_playlists.push(playlist_data)
        }

        await this.updateSongsToSort(50)

        await this.loadRandomTrack()

        // Spotify Player ========================================================== [START]
        const playerScript = document.createElement('script');
        playerScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
        playerScript.async = true;

        document.body.appendChild(playerScript);

        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const element = document.getElementById('embed-iframe');
            const options = {
                uri: `spotify:track:${this.curr_track.id}`
                };
            const callback = (EmbedController) => {
                // Set EmbedController as a global variable for later use
                window.EmbedController = EmbedController;
            };
            IFrameAPI.createController(element, options, callback);
        };
        // Spotify Player ========================================================== [END]
    }
};
</script>


<style scoped>
    .img-75 {
        width: 75px;
        height: 75px;
        object-fit: cover;
    }
    .img-200 {
        width: 200px;
        height: 200px;
        object-fit: cover;
    }
    .card-styling {
        height: 75px;
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
    .bg-selected {
        background-color: #088538;
    }
    .btn-stay-there {
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 1021;
    }
    .btn-stay-there-2 {
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 1021;
    }
    .padding-lg {
        padding-bottom: 125px;
    }
    .bg-progress-custom {
        background-color: #ade9c3;
    }
</style>