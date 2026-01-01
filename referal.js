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

const user = tg.initDataUnsafe?.user;
const userId = user ? user.id.toString() : "dev_user";
const botUsername = "nexalum_bot"; 

const inviteLink = `https://t.me/${botUsername}/app?startapp=${userId}`;

document.getElementById('copy-link-btn').onclick = () => {
    navigator.clipboard.writeText(inviteLink);
    tg.showAlert("Link copied!");
};

document.getElementById('share-link-btn').onclick = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Nexalum - Collect coins with me.!")}`;
    tg.openTelegramLink(shareUrl);
};

const usersRef = ref(db, 'users');
onValue(usersRef, (snapshot) => {
    const allUsers = snapshot.val();
    const frensList = document.getElementById('frens-list');
    const incomeEl = document.getElementById('referral-income');
    const countEl = document.getElementById('frens-count');
    
    let totalIncome = 0;
    let count = 0;
    let html = '';

    if (allUsers) {
        for (let key in allUsers) {
            if (allUsers[key].referredBy && String(allUsers[key].referredBy) === String(userId)) {
                const frenBalance = allUsers[key].balance || 0;
                const profit = Math.floor(frenBalance * 0.05); 
                totalIncome += profit;
                count++;

                // Username bo'lmasa ID ko'rsatiladi
                const displayName = allUsers[key].username ? `@${allUsers[key].username}` : `ID: ${key}`;

                html += `
                    <div class="fren-item">
                        <span class="fren-name">${displayName}</span>
                        <span class="fren-profit">+${profit.toLocaleString()}</span>
                    </div>
                `;
            }
        }
    }

    frensList.innerHTML = count > 0 ? html : '<p class="empty-msg">no offers available..</p>';
    countEl.innerText = count;
    incomeEl.innerText = totalIncome.toLocaleString();
});