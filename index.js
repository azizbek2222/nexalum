import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, update, runTransaction, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const user = tg.initDataUnsafe?.user;
const userId = user ? user.id.toString() : "test_user";
const startParam = tg.initDataUnsafe?.start_param;

const userRef = ref(db, 'users/' + userId);
let balance = 0, clickPower = 1, maxEnergy = 100, currentEnergy = 0, turboUntil = 0;

const scoreEl = document.getElementById('score');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const mainBtn = document.getElementById('main-button');

// Referallardan keladigan daromadni hisoblash va balansga qo'shish
async function syncReferralIncome() {
    const allUsersRef = ref(db, 'users');
    const snapshot = await get(allUsersRef);
    const allUsers = snapshot.val();
    
    if (allUsers) {
        let totalFrenProfit = 0;
        for (let key in allUsers) {
            if (allUsers[key].referredBy && String(allUsers[key].referredBy) === String(userId)) {
                totalFrenProfit += Math.floor((allUsers[key].balance || 0) * 0.05);
            }
        }

        // Agar hisoblangan referal daromad bazadagi "lastClaimedReferral"dan ko'p bo'lsa, balansga qo'shamiz
        const myData = allUsers[userId];
        const lastClaimed = myData?.lastClaimedReferral || 0;
        const newProfit = totalFrenProfit - lastClaimed;

        if (newProfit > 0) {
            await update(userRef, {
                balance: (myData.balance || 0) + newProfit,
                lastClaimedReferral: totalFrenProfit
            });
            tg.showAlert(`+${newProfit} coins from your referrals!`);
        }
    }
}

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
        const newUser = { 
            balance: 0, 
            clickLevel: 1, 
            energyLevel: 1, 
            energy: 100,
            lastClaimedReferral: 0,
            username: user?.username || null,
            referredBy: (startParam && startParam !== userId) ? startParam : null
        };
        update(userRef, newUser);
    }
});

// O'yinga kirganda referal daromadni tekshirish
syncReferralIncome();

mainBtn.addEventListener('pointerdown', (e) => {
    const now = Date.now();
    const activePower = now < turboUntil ? Math.floor(clickPower * 1.5) : clickPower;

    if (currentEnergy >= clickPower) {
        runTransaction(userRef, (userData) => {
            if (userData) {
                userData.balance = (userData.balance || 0) + activePower;
                userData.energy = (userData.energy !== undefined ? userData.energy : maxEnergy) - clickPower;
            }
            return userData;
        });
        showPlusOne(e, activePower);
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    } else {
        tg.showAlert("Energy is out!");
    }
});

function updateUI() {
    if(scoreEl) scoreEl.innerText = balance.toLocaleString();
    if(energyText) energyText.innerText = `${currentEnergy}/${maxEnergy}`;
    if(energyFill) energyFill.style.width = (currentEnergy / maxEnergy * 100) + "%";
}

function showPlusOne(e, power) {
    const p = document.createElement('div');
    p.innerText = "+" + power;
    p.className = 'plus-one';
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    p.style.left = x + 'px'; p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}