// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDb0vGZ7bvxqfXoKxmJzf7htUYrfKF31kA",
  authDomain: "inf-124-10961.firebaseapp.com",
  databaseURL: "https://inf-124-10961-default-rtdb.firebaseio.com",
  projectId: "inf-124-10961",
  storageBucket: "inf-124-10961.firebasestorage.app",
  messagingSenderId: "1038932690190",
  appId: "1:1038932690190:web:00f9afc8f98149e5fe435f",
  measurementId: "G-ME18D21GQY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db, collection, getDocs };