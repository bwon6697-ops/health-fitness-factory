/**
 * HEALTH & FITNESS FACTORY - Central Configuration
 * With Login Persistence + Broadcast + Personal Messages
 */

const ADMIN_EMAIL = "bwon6697@gmail.com";

const GYM_INFO = {
    name: "Health & Fitness Factory",
    brandName: "Health & Fitness Factory",
    owner: "Harshit Barnwal",
    phone: "7518141919",
    whatsapp: "917518141919",
    email: "harshitbarnwal6@gmail.com",
    adminEmail: ADMIN_EMAIL,
    address: "Mehnagar (near petrol pump), Uttar Pradesh",
    hours: {
        morning: "4:00 AM - 9:00 AM",
        evening: "5:00 PM - 10:00 PM",
        closed: "Sunday"
    },
    plans: {
        monthly: { price: 700, duration: "1 Month" },
        quarterly: { price: 1800, duration: "3 Months", special: true }
    }
};

const firebaseConfig = {
    apiKey: "AIzaSyBM3kaMBQSDKVaPvq9prmDY-bikHeW-C8w",
    authDomain: "health-fitness-factory.firebaseapp.com",
    projectId: "health-fitness-factory",
    storageBucket: "health-fitness-factory.appspot.com",
    messagingSenderId: "180675057378",
    appId: "1:180675057378:web:1674cef1ee6b02a03eb0bb",
    databaseURL: "https://health-fitness-factory-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let auth, db;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.database();
    
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => console.log("✅ Login persistence enabled"))
        .catch((error) => console.error("Persistence error:", error));
    
    console.log("✅ Firebase connected");
} catch (error) {
    console.error("❌ Firebase failed:", error.message);
}

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/jv1ngdao/image/upload";
const CLOUDINARY_PRESET = "hff_profile_pics";

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    try {
        const response = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary Error:", error.message);
        throw error;
    }
}

// ================================================================
// BROADCAST + PERSONAL MESSAGE SYSTEM
// ================================================================

function loadBroadcastBanner() {
    if (!document.getElementById('broadcastBanner')) {
        createBroadcastBanner();
    }
    
    db.ref('broadcast/current').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.active && data.message) {
            showBroadcastBanner(data.message, data.type || 'info', 'broadcast');
        }
    });
    
    auth.onAuthStateChanged((user) => {
        if (user && user.email !== ADMIN_EMAIL) {
            db.ref('users/' + user.uid + '/personalMessage').on('value', (snapshot) => {
                const data = snapshot.val();
                if (data && data.active && data.message) {
                    showBroadcastBanner(data.message, data.type || 'info', 'personal_' + user.uid);
                }
            });
        }
    });
}

function createBroadcastBanner() {
    const banner = document.createElement('div');
    banner.id = 'broadcastBanner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #FFD700;
        color: #000;
        padding: 12px 50px 12px 20px;
        z-index: 9998;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transform: translateY(-100%);
        transition: transform 0.4s ease;
    `;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'broadcastMessage';
    messageDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.1);
        border: none;
        color: #000;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    `;
    closeBtn.onclick = dismissBroadcastBanner;
    
    banner.appendChild(messageDiv);
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);
    banner.dataset.padded = 'false';
}

function showBroadcastBanner(message, type, source) {
    const dismissed = localStorage.getItem('dismissed_' + source);
    const messageHash = btoa(message).substring(0, 20);
    if (dismissed === messageHash) return;
    
    const banner = document.getElementById('broadcastBanner');
    const messageDiv = document.getElementById('broadcastMessage');
    if (!banner || !messageDiv) return;
    
    let bgColor = '#FFD700';
    let icon = '📢';
    if (type === 'warning') { bgColor = '#F59E0B'; icon = '⚠️'; }
    if (type === 'urgent') { bgColor = '#EF4444'; icon = '🚨'; }
    if (type === 'success') { bgColor = '#22C55E'; icon = '✓'; }
    if (type === 'fees') { bgColor = '#EF4444'; icon = '💰'; }
    
    let displayMessage = message;
    if (source.startsWith('personal_')) {
        displayMessage = 'Message from Owner: ' + message;
    }
    
    banner.style.background = bgColor;
    messageDiv.innerHTML = '<span style="font-size:1.2rem;">' + icon + '</span> <span>' + displayMessage + '</span>';
    
    banner.style.display = 'flex';
    setTimeout(() => banner.style.transform = 'translateY(0)', 50);
    
    if (banner.dataset.padded === 'false') {
        const bannerHeight = banner.offsetHeight;
        document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + bannerHeight) + 'px';
        banner.dataset.padded = 'true';
    }
    
    banner.dataset.messageHash = messageHash;
    banner.dataset.source = source;
}

function hideBroadcastBanner() {
    const banner = document.getElementById('broadcastBanner');
    if (!banner) return;
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        banner.style.display = 'none';
        if (banner.dataset.padded === 'true') {
            document.body.style.paddingTop = '';
            banner.dataset.padded = 'false';
        }
    }, 400);
}

function dismissBroadcastBanner() {
    const banner = document.getElementById('broadcastBanner');
    if (banner && banner.dataset.messageHash && banner.dataset.source) {
        localStorage.setItem('dismissed_' + banner.dataset.source, banner.dataset.messageHash);
    }
    hideBroadcastBanner();
}

async function sendBroadcast(message, type = 'info') {
    try {
        await db.ref('broadcast/current').set({
            message: message,
            type: type,
            active: true,
            sentAt: firebase.database.ServerValue.TIMESTAMP,
            sentBy: 'admin'
        });
        await db.ref('broadcast/history').push({
            message: message,
            type: type,
            sentAt: firebase.database.ServerValue.TIMESTAMP
        });
        return true;
    } catch (error) {
        console.error('Broadcast error:', error);
        return false;
    }
}

async function stopBroadcast() {
    try {
        await db.ref('broadcast/current').update({ active: false });
        return true;
    } catch (error) {
        return false;
    }
}

async function sendPersonalMessage(userId, message, type = 'info') {
    try {
        await db.ref('users/' + userId + '/personalMessage').set({
            message: message,
            type: type,
            active: true,
            sentAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        await db.ref('users/' + userId + '/notifications').push({
            message: message,
            type: type,
            sentAt: firebase.database.ServerValue.TIMESTAMP,
            read: false
        });
        
        return true;
    } catch (error) {
        console.error('Personal message error:', error);
        return false;
    }
}

async function stopPersonalMessage(userId) {
    try {
        await db.ref('users/' + userId + '/personalMessage').update({ active: false });
        return true;
    } catch (error) {
        return false;
    }
}

async function markFeesDue(userId, dueDate = '') {
    try {
        await db.ref('users/' + userId).update({
            feesDue: true,
            feesDueDate: dueDate,
            feesDueMarkedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        const message = dueDate 
            ? 'Your fees are due. Please pay by ' + dueDate + '. Contact owner for details.'
            : 'Your fees are due. Please pay soon to continue membership.';
        
        await sendPersonalMessage(userId, message, 'fees');
        return true;
    } catch (error) {
        console.error('Mark fees error:', error);
        return false;
    }
}

async function markFeesPaid(userId) {
    try {
        await db.ref('users/' + userId).update({
            feesDue: false,
            feesDueDate: '',
            feesPaidAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        await db.ref('users/' + userId + '/personalMessage').remove();
        
        await sendPersonalMessage(userId, 'Thank you! Your fees payment has been received.', 'success');
        
        setTimeout(async () => {
            await db.ref('users/' + userId + '/personalMessage').remove();
        }, 24 * 60 * 60 * 1000);
        
        return true;
    } catch (error) {
        console.error('Mark paid error:', error);
        return false;
    }
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function showToast(message, type = 'success') {
    let container = document.getElementById('gym-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'gym-toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#F59E0B';
    toast.style.cssText = 'background:#111;border-left:4px solid ' + bgColor + ';color:#fff;padding:12px 20px;font-family:Rajdhani,sans-serif;font-weight:600;min-width:250px;box-shadow:0 4px 12px rgba(0,0,0,0.5);transform:translateX(120%);transition:transform 0.3s ease;';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function isAdmin(email) {
    return email === ADMIN_EMAIL;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

function formatDate(date) {
    const d = new Date(date);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// EXPORTS
window.auth = auth;
window.db = db;
window.uploadToCloudinary = uploadToCloudinary;
window.ADMIN_EMAIL = ADMIN_EMAIL;
window.GYM_INFO = GYM_INFO;
window.showToast = showToast;
window.isAdmin = isAdmin;
window.getGreeting = getGreeting;
window.formatDate = formatDate;
window.loadBroadcastBanner = loadBroadcastBanner;
window.sendBroadcast = sendBroadcast;
window.stopBroadcast = stopBroadcast;
window.sendPersonalMessage = sendPersonalMessage;
window.stopPersonalMessage = stopPersonalMessage;
window.markFeesDue = markFeesDue;
window.markFeesPaid = markFeesPaid;

console.log("🚀 HFF Config Loaded ✓");
console.log("📢 Broadcast System Ready ✓");
console.log("👤 Personal Messages Ready ✓");
console.log("💰 Fees Management Ready ✓");