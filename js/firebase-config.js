/**
 * HARSHIT GYM - Central Configuration File
 * Firebase v10.7.0 (Compat) & Cloudinary Integration
 */

// =================================================================
// 1. GYM & ADMIN CONSTANTS
// =================================================================
const ADMIN_EMAIL = "bwon6697@gmail.com";

const GYM_INFO = {
    name: "Health & Fitness Factory",
    brandName: "Harshit Gym",
    owner: "Harshit Barnwal",
    phone: "7518141919",
    whatsapp: "917518141919",
    email: "harshitbarnwal6@gmail.com",
    adminEmail: ADMIN_EMAIL,
    address: "Mehnahar (near petrol pump), Uttar Pradesh",
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

// =================================================================
// 2. FIREBASE CONFIGURATION
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyBM3kaMBQSDKVaPvq9prmDY-bikHeW-C8w", // Please replace with your actual API Key from Firebase Console
    authDomain: "health-fitness-factory.firebaseapp.com",
    projectId: "health-fitness-factory",
    storageBucket: "health-fitness-factory.appspot.com",
    messagingSenderId: "180675057378", // Please replace with your actual ID
    appId: "1:180675057378:web:1674cef1ee6b02a03eb0bb", // Please replace with your actual App ID
    databaseURL: "https://health-fitness-factory-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase services
let auth, db;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.database();
    console.log("✅ Firebase connected successfully");
} catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
}

// =================================================================
// 3. CLOUDINARY CONFIGURATION & UPLOAD
// =================================================================
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/jv1ngdao/image/upload";
const CLOUDINARY_PRESET = "hff_profile_pics";

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The image file from an input field
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Cloudinary upload failed");

        const data = await response.json();
        console.log("✅ Cloudinary upload success");
        return data.secure_url;
    } catch (error) {
        console.error("❌ Cloudinary Error:", error.message);
        throw error;
    }
}

// =================================================================
// 4. UTILITY FUNCTIONS
// =================================================================

/**
 * Shows a premium notification toast
 * @param {string} message 
 * @param {'success' | 'error' | 'warning'} type 
 */
function showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('gym-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'gym-toast-container';
        toastContainer.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            display: flex; flex-direction: column; gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#F59E0B';
    
    toast.style.cssText = `
        background: #111; border-left: 4px solid ${bgColor}; color: #fff;
        padding: 12px 20px; font-family: 'Rajdhani', sans-serif; font-weight: 600;
        min-width: 250px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        transform: translateX(120%); transition: transform 0.3s ease;
        display: flex; justify-content: space-between; align-items: center;
    `;
    
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Animate In
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);

    // Remove after 3.5s
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Checks if a user is an admin
 * @param {string} email 
 * @returns {boolean}
 */
function isAdmin(email) {
    return email === ADMIN_EMAIL;
}

/**
 * Returns a time-based greeting
 * @returns {string}
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

/**
 * Formats date into "DD MMM YYYY"
 * @param {Date|string|number} date 
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// =================================================================
// 5. GLOBAL EXPORTS
// =================================================================
window.auth = auth;
window.db = db;
window.uploadToCloudinary = uploadToCloudinary;
window.ADMIN_EMAIL = ADMIN_EMAIL;
window.GYM_INFO = GYM_INFO;
window.showToast = showToast;
window.isAdmin = isAdmin;
window.getGreeting = getGreeting;
window.formatDate = formatDate;

console.log("🚀 Harshit Gym Config Loaded ✓");
console.log("📸 Cloudinary Ready ✓");