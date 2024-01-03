import axios from 'axios';

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

            await this.getUserId();
        }
    },
    
    async requestAccountAccess() {
        var codeVerifier = generateRandomString(64)
        const hashed = await sha256(codeVerifier)
        const codeChallenge = base64encode(hashed);
        
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = 'http://localhost:5173/account_authorize';
        
        const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative'; // Check out other scopes here: https://developer.spotify.com/documentation/web-api/concepts/scopes
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
            console.log('Error in running getUrlAuthCode(): ', error)
            
            throw error
        } else {
            // If there is no code or error in the url, then return false (use this to redirect to home page)
            return false
        }
    },

    async getUserId() {
        // Get the user id of the user
    
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

        var user_id

        if (localStorage.getItem('spotifyUserId')) {
            user_id = localStorage.getItem('spotifyUserId');
        } else {
            user_id = await this.getUserId();
        }

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

    async getPlaylistTracks(playlist_id, num_tracks = 50, offset = 0) {
        // Get all tracks of a playlist

        await this.updateAccessToken();

        try {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=${num_tracks}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });

            var tracks = response.data.items;

            return tracks;
        } catch (error) {
            console.error("Error in running getPlaylistTracks(): ", error);
            throw error;
        }
    },

    async getAllPlaylistTracks(playlist_id) {
        var res_tracks = [];
        var offset = 0;
        var num_tracks = 50;
        var num_tracks_returned = num_tracks;

        while (num_tracks_returned == num_tracks) {
            var tracks = await this.getPlaylistTracks(playlist_id, num_tracks, offset);

            res_tracks.push(...tracks);
            offset += num_tracks;
            num_tracks_returned = tracks.length;
        }

        console.log("All Tracks: ", res_tracks);

        return res_tracks;
    },
}