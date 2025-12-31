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
const AdController = window.Adsgram.init({ blockId: "int-20319" });

let userId = tg.initDataUnsafe?.user?.id || localStorage.getItem('local_id');
const userRef = ref(db, 'users/' + userId);

const clickCosts = [0, 5000, 25000, 125000, 625000, 3125000, 15625000, 78125000, 390625000, 1953125000];
const energyCosts = [0, 10000, 50000, 250000, 1250000, 6250000, 31250000, 156250000, 781250000, 3906250000];

onValue(userRef, (snapshot) => {
    const data = snapshot.val() || {};
    document.getElementById('display-balance').innerText = (data.balance || 0).toLocaleString();
    
    const cLvl = data.clickLevel || 1;
    document.getElementById('click-cost').innerText = cLvl < 10 ? clickCosts[cLvl].toLocaleString() : "MAX";
    document.getElementById('upgrade-click-btn').disabled = cLvl >= 10 || (data.balance || 0) < clickCosts[cLvl];
    document.getElementById('click-level').innerText = "Level " + cLvl;

    const eLvl = data.energyLevel || 1;
    document.getElementById('energy-cost').innerText = eLvl < 10 ? energyCosts[eLvl].toLocaleString() : "MAX";
    document.getElementById('upgrade-energy-btn').disabled = eLvl >= 10 || (data.balance || 0) < energyCosts[eLvl];
    document.getElementById('energy-level').innerText = "Level " + eLvl;
});

document.getElementById('ad-energy-btn').onclick = () => {
    AdController.show().then((result) => {
        if (result.done) {
            onValue(userRef, (snap) => {
                const max = (snap.val().energyLevel || 1) * 100;
                update(userRef, { energy: max });
            }, { onlyOnce: true });
            tg.HapticFeedback.notificationOccurred('success');
            alert("Energiya 100% to'ldi!");
        }
    });
};

document.getElementById('ad-turbo-btn').onclick = () => {
    AdController.show().then((result) => {
        if (result.done) {
            // Turbo vaqtini hozirgi vaqtdan 10 sekund keyinga o'rnatish
            update(userRef, { turboUntil: Date.now() + 10000 });
            tg.HapticFeedback.notificationOccurred('success');
            alert("Turbo faollashdi! 10 sekund davomida 1.5x klik!");
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