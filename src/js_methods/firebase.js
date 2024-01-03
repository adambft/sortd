import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDYrVnbj734iSixTJzMozaaQRWqaCXpo7U",
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