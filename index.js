import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. Firebase Konfiguratsiyasi
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

// 2. Foydalanuvchi identifikatori
let userId = tg.initDataUnsafe?.user?.id;
if (!userId) {
    userId = localStorage.getItem('local_id') || 'u_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('local_id', userId);
}

const userRef = ref(db, 'users/' + userId);

// 3. O'yin o'zgaruvchilari
let balance = 0;
let clickPower = 1;
let maxEnergy = 100;
let currentEnergy = 0;
let turboUntil = 0;

// DOM elementlar
const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const mainBtn = document.getElementById('main-button');

// 4. Ma'lumotlarni bazadan real vaqtda olish
onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        balance = data.balance || 0;
        clickPower = data.clickLevel || 1;
        maxEnergy = (data.energyLevel || 1) * 100;
        turboUntil = data.turboUntil || 0;
        
        // Agar bazada energiya bo'lsa o'shani olamiz, bo'lmasa maksimalni
        currentEnergy = (data.energy !== undefined) ? data.energy : maxEnergy;
        
        updateUI();
    } else {
        // Yangi foydalanuvchi yaratish
        update(userRef, { 
            balance: 0, 
            clickLevel: 1, 
            energyLevel: 1,
            energy: 100 
        });
    }
});

// 5. Kliklash hodisasi
mainBtn.addEventListener('pointerdown', (e) => {
    // Turbo rejim vaqtini tekshirish
    const isTurbo = Date.now() < turboUntil;
    const activePower = isTurbo ? Math.floor(clickPower * 1.5) : clickPower;

    if (currentEnergy >= clickPower) {
        // Lokal hisob-kitob (tezkor interfeys uchun)
        balance += activePower;
        currentEnergy -= clickPower;
        
        updateUI();
        showPlusOne(e, activePower);
        
        // Bazani yangilash
        update(userRef, { 
            balance: balance,
            energy: currentEnergy 
        });

        // Tebranish effekti
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    } else {
        // Energiya yetmasa
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        alert("Energiya tugadi! Iltimos, reklama ko'rib to'ldiring.");
    }
});

// 6. Interfeysni yangilash
function updateUI() {
    if (scoreEl) scoreEl.innerText = balance.toLocaleString();
    if (energyText) energyText.innerText = `${currentEnergy}/${maxEnergy}`;
    
    // Progress bar
    const energyPercent = (currentEnergy / maxEnergy) * 100;
    if (energyFill) energyFill.style.width = energyPercent + "%";

    // Turbo vizual effekti (tugma rangi o'zgaradi)
    const innerCircle = mainBtn.querySelector('.circle-inner');
    if (Date.now() < turboUntil) {
        innerCircle.style.borderColor = "#ff9f43";
        innerCircle.style.color = "#ff9f43";
        innerCircle.style.textShadow = "0 0 15px #ff9f43";
    } else {
        innerCircle.style.borderColor = "#4ecca3";
        innerCircle.style.color = "#4ecca3";
        innerCircle.style.textShadow = "none";
    }
}

// 7. Animatsiya (+X effekti)
function showPlusOne(e, power) {
    const p = document.createElement('div');
    p.innerText = "+" + power;
    p.className = 'plus-one';
    
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

// DIQQAT: Avtomatik energiya tiklanishi (setInterval) sizning so'rovingizga binoan olib tashlandi.