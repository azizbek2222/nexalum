import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, get } from "firebase/database";

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
tg.expand();

// Foydalanuvchi ID sini aniqlash
const userId = tg.initDataUnsafe?.user?.id || "test_user_123";
const userRef = ref(db, 'users/' + userId);

let balance = 0;
let energy = 1000;

const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('coin-button');

// 1. Bazadan ma'lumotni yuklash
onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        balance = data.balance || 0;
        scoreEl.innerText = balance.toLocaleString();
        console.log("Bazadan ma'lumot keldi:", data);
    } else {
        // Agar foydalanuvchi yo'q bo'lsa yaratish
        update(userRef, { balance: 0, username: "Player" });
    }
});

// 2. Klik funksiyasi (Asosiy qism)
coinBtn.onclick = (e) => {
    console.log("Tanga bosildi!"); // Konsolda tekshirish uchun

    if (energy > 0) {
        balance++;
        energy--;

        // UI ni darhol yangilash
        scoreEl.innerText = balance.toLocaleString();
        energyText.innerText = `${energy}/1000`;
        energyFill.style.width = (energy / 10) + "%";

        showPlusOne(e);
        saveBalance();
    } else {
        tg.HapticFeedback.notificationOccurred('error');
        alert("Energiya tugadi!");
    }
};

// Bazaga saqlash
function saveBalance() {
    update(userRef, { balance: balance });
}

function showPlusOne(e) {
    const p = document.createElement('div');
    p.innerText = "+1";
    p.className = 'plus-one';
    // Koordinatalarni mobilga moslash
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
    tg.HapticFeedback.impactOccurred('light');
}

// Energiya tiklanishi
setInterval(() => {
    if (energy < 1000) {
        energy += 1;
        energyText.innerText = `${energy}/1000`;
        energyFill.style.width = (energy / 10) + "%";
    }
}, 2000);
