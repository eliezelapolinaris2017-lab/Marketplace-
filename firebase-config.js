import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDGoSNKi1wapE1SpHxTc8wNZGGkJ2nQj7s',
  authDomain: 'nexus-transport-2887b.firebaseapp.com',
  projectId: 'nexus-transport-2887b',
  storageBucket: 'nexus-transport-2887b.firebasestorage.app',
  messagingSenderId: '972915419764',
  appId: '1:972915419764:web:7d61dfb03bbe56df867f21'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
