import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction } from "firebase/database";

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

const userId = tg.initDataUnsafe?.user?.id || "test_user_123";
const balanceRef = ref(db, `users/${userId}/balance`);
const userRef = ref(db, `users/${userId}`);

let energy = 1000;
let isSyncing = false; // Bir vaqtning o'zida ko'p so'rov ketmasligi uchun

const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('coin-button');

// 1. Bazadan ma'lumotni yuklash
onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.balance !== undefined) {
        scoreEl.innerText = data.balance.toLocaleString();
    }
});

// 2. Klik funksiyasi (Event Listener bilan)
if (coinBtn) {
    coinBtn.addEventListener('click', (e) => {
        console.log("Klik bosildi!"); // Tekshirish uchun

        if (energy > 0) {
            // UI-ni darhol yangilash (Tezkorlik uchun)
            energy--;
            updateEnergyUI();
            showPlusOne(e);

            // Bazaga yuborish
            runTransaction(balanceRef, (currentBalance) => {
                return (currentBalance || 0) + 1;
            }).catch(err => console.error("Firebase xatosi:", err));
            
        } else {
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            console.log("Energiya tugadi");
        }
    });
} else {
    console.error("coin-button elementi topilmadi!");
}

function updateEnergyUI() {
    if (energyText) energyText.innerText = `${energy}/1000`;
    if (energyFill) energyFill.style.width = (energy / 10) + "%";
}

function showPlusOne(e) {
    const p = document.createElement('div');
    p.innerText = "+1";
    p.className = 'plus-one';
    
    // Koordinatalarni aniqlash
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    
    setTimeout(() => p.remove(), 800);
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

// Energiyani tiklash
setInterval(() => {
    if (energy < 1000) {
        energy++;
        updateEnergyUI();
    }
}, 3000);
