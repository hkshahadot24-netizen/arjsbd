// db-connector.js

// ১. ফায়ারবেস মডিউলার SDK ইম্পোর্ট (সরাসরি CDN থেকে)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, enableIndexedDbPersistence, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ২. আপনার দেওয়া ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyDZ8aehJD-hBJRPwEWOeKX-Jag7pysaERU",
  authDomain: "arjs-bd.firebaseapp.com",
  databaseURL: "https://arjs-bd-default-rtdb.firebaseio.com",
  projectId: "arjs-bd",
  storageBucket: "arjs-bd.firebasestorage.app",
  messagingSenderId: "523640451117",
  appId: "1:523640451117:web:33a970c5d8aac3ea1ec8a4",
  measurementId: "G-BT4MN9TLKF"
};

// ৩. ফায়ারবেস ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ৪. চোখের পলকে ডাটা লোডিংয়ের জন্য Offline Persistence চালু করা
enableIndexedDbPersistence(db).catch((err) => {
    console.warn("অফলাইন ক্যাশ চালু করতে সমস্যা:", err.code);
});

// ৫. অ্যাপ লোডিং এবং ডাটাবেজ কানেকশন
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById('loader');
    const appShell = document.getElementById('app');
    const authUI = document.getElementById('auth');

    // বেনামী লগইন (Anonymous Auth)
    signInAnonymously(auth).then(() => {
        // আপনার সমিতির কালেকশন রেফারেন্স
        const docRef = collection(db, "ekota_sanchay_members"); 
        
        // রিয়েলটাইম লিসেনার
        onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
            if (snapshot.metadata.fromCache) {
                console.log("⚡ চোখের পলকে ক্যাশ থেকে ডাটা লোড হয়েছে!");
            } else {
                console.log("🌐 সার্ভারের সাথে নতুন ডাটা সিঙ্ক সম্পন্ন হয়েছে!");
            }

            // ডাটা পেয়ে গেলেই লোডিং স্ক্রিন সরিয়ে মূল অ্যাপ দেখানো
            if(loader) {
                loader.classList.add('hiddenx');
                loader.classList.remove('flex');
            }
            if(authUI) authUI.classList.add('hiddenx');
            if(appShell) appShell.classList.remove('hiddenx');
            
        }, (error) => {
            console.error("ডাটাবেজ কানেকশনে এরর:", error);
        });

    }).catch((error) => {
        console.error("লগইন ব্যর্থ হয়েছে:", error);
        removeLoaderInstantly(loader, appShell, authUI);
    });
    
    // ব্যাকআপ টাইমার (৭ সেকেন্ড পর লোডার বন্ধ হবে)
    setTimeout(() => removeLoaderInstantly(loader, appShell, authUI), 7000);
});

// লোডার সরানোর ফাংশন
function removeLoaderInstantly(loader, appShell, authUI) {
    if(loader && !loader.classList.contains('hiddenx')) {
        loader.classList.add('hiddenx');
        loader.classList.remove('flex');
        if(authUI) authUI.classList.add('hiddenx');
        if(appShell) appShell.classList.remove('hiddenx');
    }
}