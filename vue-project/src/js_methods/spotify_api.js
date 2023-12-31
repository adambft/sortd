import axios from 'axios';

export const SpotifyApiUtils = {
    async getAccessToken() {
        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', {
                // Request body data
                grant_type: 'client_credentials',
                client_id: '357de24bd7b34a0484553caed20898cd',
                client_secret: '',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            // Handle success response
            console.log(response.data);
            return response.data;
        } catch (error) {
            // Handle error response
            console.error(error);
            throw error; // Re-throw the error to be caught by the caller if needed
        }
    },
}