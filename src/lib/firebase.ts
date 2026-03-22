import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe89X_-HYIj-zr2AN-YQA-cMaF_RK5vjs",
  authDomain: "hydhigh-c3f6c.firebaseapp.com",
  projectId: "hydhigh-c3f6c",
  storageBucket: "hydhigh-c3f6c.firebasestorage.app",
  messagingSenderId: "418775629331",
  appId: "1:418775629331:web:ef168486954d7c29f889e6"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
