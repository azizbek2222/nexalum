import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Adsgram init (O'z blockId-ingizni qo'ying)
const AdController = window.Adsgram.init({ blockId: "int-20319" });

let userId = tg.initDataUnsafe?.user?.id || localStorage.getItem('local_id');
const userRef = ref(db, 'users/' + userId);

const clickCosts = [0, 5000, 25000, 125000, 625000, 3125000, 15625000, 78125000, 390625000, 1953125000];
const energyCosts = [0, 10000, 50000, 250000, 1250000, 6250000, 31250000, 156250000, 781250000, 3906250000];

onValue(userRef, (snapshot) => {
    const data = snapshot.val() || {};
    document.getElementById('display-balance').innerText = (data.balance || 0).toLocaleString();
    
    // Multi-click UI
    const cLvl = data.clickLevel || 1;
    if (cLvl < 10) {
        document.getElementById('click-cost').innerText = clickCosts[cLvl].toLocaleString();
        document.getElementById('upgrade-click-btn').disabled = (data.balance || 0) < clickCosts[cLvl];
    } else {
        document.getElementById('click-cost').innerText = "MAX";
        document.getElementById('upgrade-click-btn').disabled = true;
    }
    document.getElementById('click-level').innerText = "Level " + cLvl;

    // Energy UI
    const eLvl = data.energyLevel || 1;
    if (eLvl < 10) {
        document.getElementById('energy-cost').innerText = energyCosts[eLvl].toLocaleString();
        document.getElementById('upgrade-energy-btn').disabled = (data.balance || 0) < energyCosts[eLvl];
    } else {
        document.getElementById('energy-cost').innerText = "MAX";
        document.getElementById('upgrade-energy-btn').disabled = true;
    }
    document.getElementById('energy-level').innerText = "Level " + eLvl;
});

// Reklama: Full Energy
document.getElementById('ad-energy-btn').onclick = () => {
    AdController.show().then((result) => {
        if (result.done) {
            onValue(userRef, (snap) => {
                const max = (snap.val().energyLevel || 1) * 100;
                update(userRef, { energy: max });
            }, { onlyOnce: true });
            tg.HapticFeedback.notificationOccurred('success');
        }
    });
};

// Reklama: Turbo Click
document.getElementById('ad-turbo-btn').onclick = () => {
    AdController.show().then((result) => {
        if (result.done) {
            update(userRef, { turboUntil: Date.now() + 10000 });
            tg.HapticFeedback.notificationOccurred('success');
        }
    });
};

document.getElementById('upgrade-click-btn').onclick = () => buyUpgrade('clickLevel', clickCosts);
document.getElementById('upgrade-energy-btn').onclick = () => buyUpgrade('energyLevel', energyCosts);

function buyUpgrade(type, costs) {
    runTransaction(userRef, (data) => {
        if (data) {
            const lvl = data[type] || 1;
            if (data.balance >= costs[lvl] && lvl < 10) {
                data.balance -= costs[lvl];
                data[type] = lvl + 1;
            }
        }
        return data;
    });
}