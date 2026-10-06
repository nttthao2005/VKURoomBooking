import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCcyaRUbL_taKuCEbtzHy3UxbKrIhXW9ds',
  authDomain: 'vku-room-booking-cf01f.firebaseapp.com',
  projectId: 'vku-room-booking-cf01f',
  storageBucket: 'vku-room-booking-cf01f.firebasestorage.app',
  messagingSenderId: '672902287007',
  appId: '1:672902287007:web:dcf6644401eb4df2109caa',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);