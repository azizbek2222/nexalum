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

const userId = tg.initDataUnsafe?.user?.id || "local_test_id";
const balanceRef = ref(db, `users/${userId}/balance`);

let energy = 1000;

const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('coin-button');

// 1. Bazadan balansni yuklash
onValue(balanceRef, (snapshot) => {
    const val = snapshot.val();
    scoreEl.innerText = (val || 0).toLocaleString();
});

// 2. KLIK FUNKSIYASI (Eng barqaror usul)
const handleInteraction = (e) => {
    if (energy > 0) {
        energy--;
        updateUI();
        showPlusOne(e);

        // Firebase-da balansni 1 taga oshirish
        runTransaction(balanceRef, (current) => {
            return (current || 0) + 1;
        });

        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    }
};

// Hodisalarni bog'lash
if (coinBtn) {
    coinBtn.addEventListener('pointerdown', handleInteraction);
}

function updateUI() {
    energyText.innerText = `${energy}/1000`;
    energyFill.style.width = (energy / 10) + "%";
}

function showPlusOne(e) {
    const p = document.createElement('div');
    p.innerText = "+1";
    p.className = 'plus-one';
    
    // Koordinatalarni aniqlash
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
}

// Energiya tiklanishi
setInterval(() => {
    if (energy < 1000) {
        energy++;
        updateUI();
    }
}, 2000);
