import axios from 'axios';

export const LastFmApiUtils = {
    async getTrackTags(artist_name, track_name, num_tags=-1) {
        // get track's tags

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&api_key=${import.meta.env.VITE_LAST_FM_API_KEY}&artist=${artist_name}&track=${track_name}&format=json`, { //RJ
            });

            // return empty array if error encountered
            if (response.data.error) {
                return [];
            }

            var tags = response.data.toptags.tag;

            if (num_tags > -1) {
                tags = tags.slice(0, num_tags);
            }

            for (var i = 0; i < tags.length; i++) {
                tags[i].name = tags[i].name.toLowerCase();
            }

            return tags;
        } catch (error) {
            console.error("Error in running getTrackTags(): ", error);
            throw error;
        }
    },
}