import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrMKJ4MPilQg6gZsaE-Hlqlgo5F4Q8IsM",
    authDomain: "xabar-tizimi.firebaseapp.com",
    databaseURL: "https://xabar-tizimi-default-rtdb.firebaseio.com",
    projectId: "xabar-tizimi",
    storageBucket: "xabar-tizimi.firebasestorage.app",
    messagingSenderId: "3947028451",
    appId: "1:3947028451:web:c14f1ed82dad6a3c520ad6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tg = window.Telegram.WebApp;

// Telegram ma'lumotlarini olish
const user = tg.initDataUnsafe?.user;
const userId = user ? user.id.toString() : "dev_user";

// UI elementlarni to'ldirish
if (user) {
    document.getElementById('user-name').innerText = user.first_name + (user.last_name ? " " + user.last_name : "");
    document.getElementById('user-id-text').innerText = "ID: " + user.id;
    if (user.photo_url) {
        document.getElementById('user-photo').src = user.photo_url;
    }
}

// Firebase'dan balansni olish
const userRef = ref(db, 'users/' + userId);
onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById('profile-balance').innerText = (data.balance || 0).toLocaleString();
        
        // Balansga qarab rank berish (misol uchun)
        let rank = "Explorer";
        if (data.balance > 100000) rank = "Warrior";
        if (data.balance > 1000000) rank = "Legend";
        document.getElementById('user-rank').innerText = rank;
    }
});