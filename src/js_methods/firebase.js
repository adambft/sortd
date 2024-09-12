import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, GoogleAuthProvider, onAuthStateChanged,signOut, signInWithPopup } from "firebase/auth";
import { SpotifyApiUtils } from '../js_methods/spotify_api'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDYrVnbj734iSixTJzMozaaQRWqaCXpo7U", // Note: This is a public key, not a secret: https://firebase.google.com/docs/projects/api-keys#:~:text=it%27s%20not%20necessary%20to%20treat%20an%20API%20key%20for%20Firebase%20services%20as%20a%20secret
    authDomain: "spotify-sorter-adambft.firebaseapp.com",
    databaseURL: "https://spotify-sorter-adambft-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "spotify-sorter-adambft",
    storageBucket: "spotify-sorter-adambft.appspot.com",
    messagingSenderId: "937914844010",
    appId: "1:937914844010:web:b4748640cc23473a661b13",
    measurementId: "G-7N1NEP4CR5"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase database
const db = getDatabase(firebaseApp);

// Initialize Firebase auth
const auth = getAuth();

// REALTIME DATABASE FUNCTIONS ========================================================

// Base functions ---------------------------------------------------------------------
export async function readDb(filepath) {
    return new Promise((resolve, reject) => {
        const myref = ref(db, filepath);

        onValue(myref, (snapshot) => {
            const data = snapshot.val();
            resolve(data);
        }, (error) => {
            reject(error);
        });
    });
}

export async function writeDb(filepath, data) {
    return new Promise((resolve, reject) => {
        const myref = ref(db, filepath);

        set(myref, data).then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });
    });
}

// Read functions -------------------------------------------------------------------
export async function readAllAccountData() {
    // Returns all account data (reminder: this is <firebase_acc>/<spotify_acc> data. Each firebase_acc can have multiple spotify_acc)
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}`;

    var res = await readDb(filepath);
    return res;
}

export async function readSongsSelected() {
    // Returns data from <firebase_acc>/<spotify_acc>/songs_selected
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/songs_selected`;

    var res = await readDb(filepath);
    return res;
}

export async function readSongsSelectedSpecificTrack(track_id) {
    // Returns data from <firebase_acc>/<spotify_acc>/songs_selected/<track_id>
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/songs_selected/${track_id}`;

    var res = await readDb(filepath);
    return res;
}

export async function readNewPlaylists() {
    // Returns data from <firebase_acc>/<spotify_acc>/new_playlists
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/new_playlists`;

    var res = await readDb(filepath);
    return res;
}

export async function readSortedSongs() {
    // Returns data from <firebase_acc>/<spotify_acc>/sorted_songs
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/sorted_songs`;

    var res = await readDb(filepath);
    return res;
}

export async function readSortedSongsSpecificTrack(track_id) {
    // Returns data from <firebase_acc>/<spotify_acc>/sorted_songs/<track_id>
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/sorted_songs/${track_id}`;

    var res = await readDb(filepath);
    return res;
}

// Write functions -------------------------------------------------------------------
export async function createNewBlankUser() {
    // Creates a new blank user in the database
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}`;
    await writeDb(filepath, '');
    return;
}

export async function writeToCurrPlaylists(dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/curr_playlists
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/curr_playlists`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function writeToSongsSelected(dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/songs_selected
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/songs_selected`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function writeToSongsSelectedSpecificTrack(track_id, dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/songs_selected/<track_id>
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/songs_selected/${track_id}`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function writeToNewPlaylists(dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/new_playlists
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/new_playlists`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function writeToSortedSongs(dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/sorted_songs
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/sorted_songs`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function writeToSortedSongsSpecificTrack(track_id, dataToWrite) {
    // Writes data to <firebase_acc>/<spotify_acc>/sorted_songs/<track_id>
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}/sorted_songs/${track_id}`;

    await writeDb(filepath, dataToWrite);
    return;
}

export async function deleteAllSpotifyAccountData() {
    // Deletes all data for the current Spotify account
    var firebase_id = await getCurrentUserID();
    var spotify_id = await SpotifyApiUtils.getUserId();

    var filepath = `${firebase_id}/${spotify_id}`;

    await writeDb(filepath, null);
    return;
}


// AUTH FUNCTIONS =======================================================================
export async function login() {
    // 1) Check if user already logged in ..........................
    if (await isUserLoggedIn()) {
        return;
    }

    // 2) If not logged in, then log in ............................

    // Initialize Google auth provider
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);

        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log("User signed in:", user);
    } catch (error) {
        // Handle Errors here.
        console.error("Error during sign in:", error);
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;  // The email of the user's account used.
        const credential = GoogleAuthProvider.credentialFromError(error);  // The AuthCredential type that was used.
    }
}

export function logout() {
    return new Promise((resolve, reject) => {
        signOut(auth).then(() => {
            // Sign-out successful.
            resolve(true);
        }).catch((error) => {
            // An error happened.
            console.error("An error happened while signing out");
            reject(error);
        });
    });
}

export function isUserLoggedIn() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                resolve(true);
            } else {
                // User is signed out
                resolve(false);
            }
        }, reject); // Pass the reject function to handle any errors
    });
}

export async function getCurrentUser() {
    // Returns entire user object
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                resolve(user);
            } else {
                // User is signed out
                resolve(null);
            }
        }, reject); // Pass the reject function to handle any errors
    });
}

export async function getCurrentUserID() {
    // Returns user ID
    var user = await getCurrentUser();
    
    if (user) {
        return user.uid;
    } else {
        return null;
    }
}