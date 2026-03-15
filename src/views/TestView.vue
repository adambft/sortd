<template>
    <div class="p-3">
        <p>Test playlist ID: "58OMB8vgswYnfkwXqAZfM4"</p>
        <p>Organic playlist ID: "2VWepnrX9rW8kkawS5bFfa"</p>

        <p>Without you (VALID): 6R6ux6KaKrhAg2EIB2krdU</p>
        <p>Without you (INVALID): 2nCMEzjPxnlIZyqjtyOw2d</p>

        <!-- <button class="btn btn-primary me-3" @click="add()">Add</button>
        <button class="btn btn-primary me-3" @click="get50tracks()">See playlist tracks (first 50)</button>
        <button class="btn btn-primary me-3" @click="getAllPlTracks()">Get all playlist tracks</button>
        <button class="btn btn-primary me-3" @click="getoneplaylist()">Get one playlist item</button> -->
        <button class="btn btn-primary me-3" @click="getAllPlaylists()">Get all playlists</button>
        <!--
        <button class="btn btn-primary me-3" @click='getsorted()'>Get sorted songs</button>
        <button class="btn btn-primary me-3" @click="getNoSong()">Get song that doesnt exit</button>
        <button class="btn btn-primary me-3" @click="getOneTrack()">Get 1 track</button>
        <button class="btn btn-primary me-3" @click="pushOneTrack()">Push 1 track</button> -->

        <!-- To Test Adding and Deleting from Playlist -->
        <input type="text" v-model="trackIdSelected" placeholder="Track ID" class="me-3">
        <input type="text" v-model="playlistIdSelected" placeholder="Playlist ID" class="me-3">

        <p v-if="trackIdSelected != '' && playlistIdSelected != ''">Click add to add this track ID: {{ trackIdSelected }} from this playlist ID: {{ playlistIdSelected }}</p>
        <button class="btn btn-primary me-3" @click="addOneTrack()">Add 1 track</button>

        <p v-if="trackIdSelected != '' && playlistIdSelected != ''">Click delete to delete this track ID: {{ trackIdSelected }} from this playlist ID: {{ playlistIdSelected }}</p>
        <button class="btn btn-primary me-3" @click="deleteOneTrack()">Delete 1 track</button>


        <input type="text" v-model="searchQuery">
        <button class="btn btn-success me-3" @click="searchTrack(searchQuery)">Search (general)</button>
        <button class="btn btn-warning me-3" @click="searchInLibrary(searchQuery)">Search (in library)</button>
    
        <div v-for="(e_res, index) in searchResults" class="ms-3 mt-4">
            <img :src="e_res.album.images[0].url" width="100px">
            <h5>{{ e_res.name }}</h5>
            <h5>Track id: {{ e_res.id }}</h5>
            <p v-for="(e_artist, index2) in e_res.artists">{{ e_artist.name }}</p>
        </div>
    </div>
</template>

<script>
import * as firebase from '../js_methods/firebase'
import { SpotifyApiUtils } from '../js_methods/spotify_api'

export default {
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            trackIdSelected: '',
            playlistIdSelected: '',
        };
    },
    methods: {   
        async add() {
            var pl = '2Gti5HH2TmkKctpijmm7hW'
            var xxx = ['00OpO6WZ3njgKoXHeFC4ld' , '00Y89Ir6nXEQdKQb3GLjet' , '00eSBjcEtF8WcKyUKE86ee' , '00hTw7P6jPUio5Qgojw38w' , '01EvpmJCelI4Gbf4Ksp1v2']
            
            await SpotifyApiUtils.addTracksToPlaylist(pl, xxx)
            console.log("added done ====")
        },
        async get50tracks() {
            var pl = '2Gti5HH2TmkKctpijmm7hW'

            await SpotifyApiUtils.getPlaylistTracks(pl, 5, 0)
        },
        async getAllPlTracks() {
            var x = await SpotifyApiUtils.getAllPlaylistTrackIds("2Gti5HH2TmkKctpijmm7hW")
            console.log("All tracks: ", x)
        },

        async getoneplaylist() {
            var x = await SpotifyApiUtils.getOnePlaylist("7pbVe4a4BV972a6b50pk6A")
            console.log("Playlist data: ", x)
        },
        async getAllPlaylists() {
            var x = await SpotifyApiUtils.getAllPlaylists()
            console.log("All playlists: ", x)
        },
        async getsorted() {
            var x = await firebase.readDb(`/${localStorage.getItem('spotifyUserId')}/sorted_songs`)
            console.log("Sorted songs: ", x)
        },
        async getNoSong() {
            var x = await firebase.readDb(`/${localStorage.getItem('spotifyUserId')}/sorted_songs/00OpO638fnjgKoXHeF83d`)
            console.log("No song: ", x)
        },
        async searchTrack(query) {
            var x = await SpotifyApiUtils.searchForTrack(query, 10)
            this.searchResults = x
        },
        async searchInLibrary(query) {
            var x = await SpotifyApiUtils.searchForTrackInLibrary(query)
            this.searchResults = x
        },
        async getOneTrack() {
            var x = await SpotifyApiUtils.getOneTrack('00OpO6WZ3njgKoXHeFC4ld')
            console.log("One track: ", x)
        },
        async pushOneTrack() {
            await SpotifyApiUtils.pushSingleTrackToDb('37wuSLIK22IxGKffovC6jd')
            console.log("DONED")
        },
        async addOneTrack() {
            console.log("addOneTrack() called ===")
            await SpotifyApiUtils.add1TrackToPlaylist(
                this.playlistIdSelected, this.trackIdSelected
            )
            console.log("addOneTrack() DONED ---")
        },
        async deleteOneTrack() {
            console.log("deleteOneTrack() called ===")
            await SpotifyApiUtils.delete1TrackFromPlaylist(
                this.playlistIdSelected, this.trackIdSelected
            )
            console.log("deleteOneTrack() DONED ---")
        }
    },
    async mounted() {
        // console.log(await SpotifyApiUtils.getAllPlaylists())

        // test playlist: 2Gti5HH2TmkKctpijmm7hW
        // happy playlist: 49XDWYO8BRVElIUlVD1k66
        // chill playlist: 7pbVe4a4BV972a6b50pk6A

        // songs: 00OpO6WZ3njgKoXHeFC4ld , 00Y89Ir6nXEQdKQb3GLjet , 00eSBjcEtF8WcKyUKE86ee , 00hTw7P6jPUio5Qgojw38w , 01EvpmJCelI4Gbf4Ksp1v2        
        // summer belongs to you: 37wuSLIK22IxGKffovC6jd
    },
}
</script>