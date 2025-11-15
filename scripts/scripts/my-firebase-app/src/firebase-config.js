import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyACwYzM9gMpz3qUtaHjfN4wbWJHspvIa_g",
  authDomain: "megastore-de3b2.firebaseapp.com",
  databaseURL: "https://megastore-de3b2-default-rtdb.firebaseio.com",
  projectId: "megastore-de3b2",
  storageBucket: "megastore-de3b2.appspot.com",
  messagingSenderId: "283192477512",
  appId: "1:283192477512:web:5330e3bbcf1063875cd57d",
  measurementId: "G-54VSE54GGB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, db, analytics };
