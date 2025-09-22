import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7crn7YZ8c082bRfCIb-8lQLZl7cNyafk",
  authDomain: "slask-finder.firebaseapp.com",
  projectId: "slask-finder",
  storageBucket: "slask-finder.firebasestorage.app",
  messagingSenderId: "995708864992",
  appId: "1:995708864992:web:e5066368a7cf72d8280385",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;

const messaging = getMessaging(firebaseApp);
export { messaging };
