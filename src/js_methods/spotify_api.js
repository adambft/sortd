import axios from 'axios';
import * as firebase from './firebase'

// Helper functions from Spotify API Official Documentation =========================================[start]
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++[end]


// Personal helper functions =======================================================================[start]
function mergeTrackObjects(obj1, obj2) {
    const result = {};

    // Combine ids from both objects
    const allIds = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    // Iterate through all ids
    allIds.forEach(e_id => {
        // Check if the id is present in both objects
        if (obj1.hasOwnProperty(e_id) && obj2.hasOwnProperty(e_id)) {
            // Compare "date added" to determine which one to include
            const dateAdded1 = new Date(obj1[e_id]["date_added"]);
            const dateAdded2 = new Date(obj2[e_id]["date_added"]);

            // Choose the one with the latest "date added"
            result[e_id] = dateAdded1.getTime() > dateAdded2.getTime() ? { ...obj1[e_id] } : { ...obj2[e_id] };
        } else {
            // Include the id from the object that has it
            result[e_id] = obj1.hasOwnProperty(e_id) ? { ...obj1[e_id] } : { ...obj2[e_id] };
        }
    });

    return result;
}
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++[end]

export const SpotifyApiUtils = {
    async getAccessToken_client() {
        // Request a new access token from Spotify (client - limited access)

        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', {
                grant_type: 'client_credentials',
                client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
                client_secret: import.meta.env.VITE_SPOTIFY_SECRET_KEY,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error("Error in running getAccessToken_client(): ", error);
            throw error;
        }
    },

    async getAccessToken_auth(code, getAllData = false) {
        // Request a new access token from Spotify (auth - full access)
        
        let codeVerifier = localStorage.getItem('codeVerifier');

        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', {
                client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'http://localhost:5173/account_authorize',
                code_verifier: codeVerifier,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            if (getAllData) {
                return response.data;
            } else {
                return response.data.access_token;
            }
        } catch (error) {
            console.error("Error in running getAccessToken_auth(): ", error);
            throw error;
        }
    },

    async updateAccessToken() {
        // Update the access token if it is expired, else do nothing

        // If user logged out, redirect to home page
        if (localStorage.getItem('userLoggedOut')) {
            localStorage.removeItem('userLoggedOut')

            window.location.href = '/';
            return
        }

        if (localStorage.getItem('accessToken')) {
            const accessTokenTime = localStorage.getItem('accessTokenTime');
            const currentTime = Date.now();
            const timeDifference = currentTime - accessTokenTime;
            const minutesDifference = timeDifference / 60000;

            if (minutesDifference < 55) {
                return true;
            }
        }

        localStorage.setItem('awaiting_access_token_update', true);
        this.requestAccountAccess();
    },

    async continueUpdateAccessToken(code) {
        // Continues updateAccessToken() if it is awaiting an update

        if (localStorage.getItem('awaiting_access_token_update')) {
            const reqData = await this.getAccessToken_auth(code, true);

            const accessToken = reqData.access_token;
            const refreshToken = reqData.refresh_token;
            const scope = reqData.scope;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('scope', scope);
            localStorage.setItem('accessTokenTime', Date.now());
            localStorage.removeItem('awaiting_access_token_update');

            var user_spotify_id = await this.getUserId();

            // check if user account already created
            var existing_db_data = await firebase.readDb(`${user_spotify_id}`);

            if (existing_db_data == null) {
                // create new user account
                await firebase.writeDb(`${user_spotify_id}`, '')
            }

            // reload to force navbar to update
            window.location.reload();
        }
    },
    
    async requestAccountAccess() {
        var codeVerifier = generateRandomString(64)
        const hashed = await sha256(codeVerifier)
        const codeChallenge = base64encode(hashed);
        
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = 'http://localhost:5173/account_authorize';
        
        const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming'; // Check out other scopes here: https://developer.spotify.com/documentation/web-api/concepts/scopes
        const authUrl = new URL("https://accounts.spotify.com/authorize")
        
        // generated in the previous step
        window.localStorage.setItem('codeVerifier', codeVerifier);
        
        const params =  {
            response_type: 'code',
            client_id: clientId,
            scope,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
        }
        
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    },
    
    getUrlAuthCode() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('code')) {
            let code = urlParams.get('code');
            
            return code
        } else if (urlParams.has('error')) {
            let error = urlParams.get('error')
            console.error('Error in running getUrlAuthCode(): ', error)
            
            throw error
        } else {
            // If there is no code or error in the url, then return false (use this to redirect to home page)
            return false
        }
    },

    async getUserId() {
        // Get the user id of the user

        // Break if user id is already stored
        if (localStorage.getItem('spotifyUserId')) {
            return localStorage.getItem('spotifyUserId');
        }
    
        await this.updateAccessToken();
    
        try {
            const response = await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });
            var user_info = response.data;
            var user_id = user_info.id;

            localStorage.setItem('spotifyUserId', user_id);
    
            return user_id;
        } catch (error) {
            console.error("Error in running getUserId(): ", error);
            throw error;
        }
    },

    async getPlaylists(num_playlists = 50, offset = 0) {
        // Get all playlists of the user

        await this.updateAccessToken();

        var user_id = await this.getUserId()

        try {
            const response = await axios.get(`https://api.spotify.com/v1/users/${user_id}/playlists?limit=${num_playlists}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var playlists = response.data.items;

            return playlists;
        } catch (error) {
            console.error("Error in running getAllPlaylists(): ", error);
            throw error;
        }
    },

    async getAllPlaylists() {
        var res_playlists = [];
        var offset = 0;
        var num_playlists = 50;
        var num_playlists_returned = num_playlists;

        while (num_playlists_returned == num_playlists) {
            var playlists = await this.getPlaylists(num_playlists, offset);

            res_playlists.push(...playlists);
            offset += num_playlists;
            num_playlists_returned = playlists.length;
        }

        return res_playlists;
    },

    async getOnePlaylist(playlist_id) {
        // Get one playlist of the user

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var playlist = response.data;

            return playlist;
        } catch (error) {
            console.error("Error in running getOnePlaylist(): ", error);
            throw error;
        }
    },

    async getPlaylistTracks(playlist_id, num_tracks = 50, offset = 0, return_all_data = false) {
        // Get tracks of a playlist

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=${num_tracks}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            if (return_all_data) {
                return response.data;
            } else {
                return response.data.items;
            }
        } catch (error) {
            console.error("Error in running getPlaylistTracks(): ", error);
            throw error;
        }
    },

    async getAllPlaylistTrackIds(playlist_id) {
        var res_tracks = new Set();
        var offset = 0;
        var num_tracks = 50;
        var tracks_gotten = 0;

        // first iteration (get first 50)
        var tracks_data = await this.getPlaylistTracks(playlist_id, num_tracks, offset, true);

        var tracks = tracks_data.items;
        var total_tracks = tracks_data.total;

        // add only the track's id to the result
        tracks.forEach(element => {
            res_tracks.add(element.track.id);
        });

        offset += num_tracks;
        tracks_gotten += tracks.length;
        
        while (tracks_gotten < total_tracks) {
            var tracks = await this.getPlaylistTracks(playlist_id, num_tracks, offset);

            tracks.forEach(element => {
                res_tracks.add(element.track.id);
            });

            offset += num_tracks;
            tracks_gotten += tracks.length;
        }

        return res_tracks;
    },

    async getTracksAudioFeatures(track_ids) {
        // Get audio features of a track

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${track_ids}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var audio_features = response.data.audio_features;

            return audio_features;
        } catch (error) {
            console.error("Error in running getTracksAudioFeatures(): ", error);
            throw error;
        }
    },

    async getOneTrack(track_id) {
        // Get one track

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/tracks/${track_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var track = response.data;

            return track;
        } catch (error) {
            console.error("Error in running getOneTrack(): ", error);
            throw error;
        }
    },

    async getPlaylistTracksAndPushToDb(playlist_id, num_tracks = 50, offset = 0) {
        var tracks = await this.getPlaylistTracks(playlist_id, num_tracks, offset);
        var res_to_db = {};
        var track_ids = [];

        // Build result with track data
        for (var i = 0; i < tracks.length; i++) {
            var e_track = tracks[i];

            var track_id = e_track.track.id;

            var track_name = e_track.track.name;
            var track_date_added = e_track.added_at;
            var track_release_date = e_track.track.album.release_date;
            var artist_ids = []

            e_track.track.artists.forEach(element => {
                var e_artist_id = element.id;
                artist_ids.push(e_artist_id);
            });

            var track_popularity = e_track.track.popularity;
            var track_preview_url = e_track.track.preview_url;
            var track_img_url = e_track.track.album.images[0].url;

            res_to_db[track_id] = {
                name: track_name,
                date_added: track_date_added,
                release_date: track_release_date,
                artist_ids: artist_ids,
                popularity: track_popularity,
                preview_url: track_preview_url,
                img_url: track_img_url,
            }

            track_ids.push(track_id);
        }

        // Build result with audio features
        var audio_features = await this.getTracksAudioFeatures(track_ids.join(','))

        for (var i = 0; i < audio_features.length; i++) {
            var e_audio_feature = audio_features[i];

            var track_id = e_audio_feature.id;
            
            var acousticness = e_audio_feature.acousticness;
            var danceability = e_audio_feature.danceability;
            var energy = e_audio_feature.energy;
            var instrumentalness = e_audio_feature.instrumentalness;
            var key = e_audio_feature.key;
            var liveness = e_audio_feature.liveness;
            var loudness = e_audio_feature.loudness;
            var mode = e_audio_feature.mode;
            var speechiness = e_audio_feature.speechiness;
            var tempo = e_audio_feature.tempo;
            var time_signature = e_audio_feature.time_signature;
            var valence = e_audio_feature.valence;

            res_to_db[track_id].acousticness = acousticness;
            res_to_db[track_id].danceability = danceability;
            res_to_db[track_id].energy = energy;
            res_to_db[track_id].instrumentalness = instrumentalness;
            res_to_db[track_id].key = key;
            res_to_db[track_id].liveness = liveness;
            res_to_db[track_id].loudness = loudness;
            res_to_db[track_id].mode = mode;
            res_to_db[track_id].speechiness = speechiness;
            res_to_db[track_id].tempo = tempo;
            res_to_db[track_id].time_signature = time_signature;
            res_to_db[track_id].valence = valence;
        }

        // Fetch existing data from db
        var existing_db_data = await firebase.readDb(`${localStorage.getItem('spotifyUserId')}/songs_selected`);

        if (existing_db_data == null) {
            existing_db_data = {};
        }

        // Merge existing data with new data
        var merged_data = mergeTrackObjects(existing_db_data, res_to_db);

        // Push back to db
        await firebase.writeDb(`${localStorage.getItem('spotifyUserId')}/songs_selected`, merged_data);

        return tracks.length;
    },

    async createNewPlaylist(playlist_name, playlist_desc=false) {
        // Create a new playlist

        await this.updateAccessToken();

        var user_id = await this.getUserId();

        var new_pl_info = {
            name: playlist_name,
        }

        if (playlist_desc) {
            new_pl_info.description = playlist_desc;
        }

        try {
            const response = await axios.post(`https://api.spotify.com/v1/users/${user_id}/playlists`, new_pl_info, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var new_playlist = response.data;

            return new_playlist;
        } catch (error) {
            console.error("Error in running createNewPlaylist(): ", error);
            throw error;
        }
    },

    async getArtists(artist_ids) {
        // Get artists

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${artist_ids}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var artists = response.data.artists;

            return artists;
        } catch (error) {
            console.error("Error in running getArtists(): ", error);
            throw error;
        }
    },

    async transferPlaybackToBrowser() {
        // Transfer playback to browser

        if (!localStorage.getItem('spotifyDeviceId')) {
            console.error("No spotify device id");

            return false;
        }

        await this.updateAccessToken();

        try {
            const response = await axios.put(`https://api.spotify.com/v1/me/player`, {
                device_ids: [localStorage.getItem('spotifyDeviceId')],
                play: false,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            return true;
        } catch (error) {
            console.error("Error in running trasnferPlaybackToBrowser(): ", error);
            throw error;
        }
    },

    async queueTrack(track_id) {
        // Queue a track

        await this.updateAccessToken();

        if (!localStorage.getItem('spotifyDeviceId')) {
            console.error("Error in running queueTrack(): No spotify device id");

            return false;
        }

        try {
            const response = await axios.put(`https://api.spotify.com/v1/me/player/play`,
            {
                uris: [`spotify:track:${track_id}`],
                position_ms: 0,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            return true;
        } catch (error) {
            console.error("Error in running queueTrack(): ", error);
            throw error;
        }    
    },

    async getPlaybackState() {
        // Get playback state

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/me/player`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var playback_state = response.data;
            return playback_state;
        } catch (error) {
            console.error("Error in running getPlaybackState(): ", error);
            throw error;
        }
    },

    async add100TracksToPlaylist(playlist_id, track_ids_arr) {
        // Add tracks to playlist (max 100 tracks per request)

        await this.updateAccessToken();

        var all_tracks_arr = [];

        for (var i = 0; i < track_ids_arr.length; i++) {
            var e_track_id = track_ids_arr[i];

            all_tracks_arr.push(`spotify:track:${e_track_id}`);
        }

        try {
            const response = await axios.post(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                uris: all_tracks_arr,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            return true;
        } catch (error) {
            console.error("Error in running addTracksToPlaylist(): ", error);
            throw error;
        }
    },

    async addTracksToPlaylist(playlist_id, track_ids_arr) {
        // Add all tracks to playlist, ensure no duplicates

        await this.updateAccessToken();

        var offset = 0;
        var num_tracks = 100;
        var playlist_existing_tracks = await this.getAllPlaylistTrackIds(playlist_id);

        // Remove tracks that already exist in the playlist
        track_ids_arr = track_ids_arr.filter(e_id => !playlist_existing_tracks.has(e_id));

        while (offset < track_ids_arr.length) {
            var tracks_to_add = track_ids_arr.slice(offset, offset + num_tracks);

            await this.add100TracksToPlaylist(playlist_id, tracks_to_add);

            offset += num_tracks;
        }

        return true;
    },
}