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
const botUsername = "nexalum_bot"; // Bot username

// Referal havolasini tayyorlash
const inviteLink = `https://t.me/${botUsername}/app?startapp=${userId}`;

document.getElementById('copy-link-btn').onclick = () => {
    navigator.clipboard.writeText(inviteLink);
    tg.showAlert("Link copied!");
};

document.getElementById('share-link-btn').onclick = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Collect coins with me in the game Nexalum!")}`;
    tg.openTelegramLink(shareUrl);
};

// Referallarni yuklash va 5% hisoblash
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
            // Agar foydalanuvchining 'referredBy' qiymati bizning ID ga teng bo'lsa
            if (allUsers[key].referredBy == userId) {
                const frenBalance = allUsers[key].balance || 0;
                const profit = Math.floor(frenBalance * 0.05); // 5% keshbek
                totalIncome += profit;
                count++;

                html += `
                    <div class="fren-item">
                        <span class="fren-name">${allUsers[key].username || "User " + key.slice(0,5)}</span>
                        <span class="fren-profit">+${profit.toLocaleString()}</span>
                    </div>
                `;
            }
        }
    }

    if (count > 0) {
        frensList.innerHTML = html;
    }
    countEl.innerText = count;
    incomeEl.innerText = totalIncome.toLocaleString();
});