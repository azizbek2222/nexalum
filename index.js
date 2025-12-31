import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

let userId = tg.initDataUnsafe?.user?.id || localStorage.getItem('local_id') || 'u_' + Math.random().toString(36).substr(2, 9);
if (!localStorage.getItem('local_id')) localStorage.setItem('local_id', userId);

const userRef = ref(db, 'users/' + userId);

let balance = 0, clickPower = 1, maxEnergy = 100, currentEnergy = 0, turboUntil = 0;

const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const mainBtn = document.getElementById('main-button');

onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        balance = data.balance || 0;
        clickPower = data.clickLevel || 1;
        maxEnergy = (data.energyLevel || 1) * 100;
        turboUntil = data.turboUntil || 0;
        currentEnergy = (data.energy !== undefined) ? data.energy : maxEnergy;
        updateUI();
    } else {
        update(userRef, { balance: 0, clickLevel: 1, energyLevel: 1, energy: 100 });
    }
});

mainBtn.addEventListener('pointerdown', (e) => {
    // Turbo rejimini tekshirish (1.5x)
    const now = Date.now();
    const isTurbo = now < turboUntil;
    const activePower = isTurbo ? Math.floor(clickPower * 1.5) : clickPower;

    if (currentEnergy >= clickPower) {
        // Balansni bazada tranzaksiya orqali oshirish (xavfsiz usul)
        runTransaction(userRef, (userData) => {
            if (userData) {
                userData.balance = (userData.balance || 0) + activePower;
                userData.energy = (userData.energy !== undefined ? userData.energy : maxEnergy) - clickPower;
            }
            return userData;
        });

        // Lokal UI yangilash (darhol ko'rinishi uchun)
        balance += activePower;
        currentEnergy -= clickPower;
        updateUI();
        showPlusOne(e, activePower);

        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    } else {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        alert("Energiya tugadi! Update bo'limidan reklama ko'rib to'ldiring.");
    }
});

function updateUI() {
    scoreEl.innerText = balance.toLocaleString();
    energyText.innerText = `${currentEnergy}/${maxEnergy}`;
    energyFill.style.width = (currentEnergy / maxEnergy * 100) + "%";

    const innerCircle = mainBtn.querySelector('.circle-inner');
    if (Date.now() < turboUntil) {
        innerCircle.style.borderColor = "#ff9f43"; // Turbo rang
        innerCircle.style.color = "#ff9f43";
        innerCircle.style.boxShadow = "inset 0 0 20px #ff9f43";
    } else {
        innerCircle.style.borderColor = "#4ecca3";
        innerCircle.style.color = "#4ecca3";
        innerCircle.style.boxShadow = "none";
    }
}

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