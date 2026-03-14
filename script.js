<script>
       // 1. Firebase Configuration (Wahi rahegi jo aapne di hai)
const firebaseConfig = {
    apiKey: "AIzaSyBWyMJvt0OpejwkFEstI_NQToHmMBGwkbE",
    authDomain: "agency-136b6.firebaseapp.com",
    projectId: "agency-136b6",
    storageBucket: "agency-136b6.firebasestorage.app",
    messagingSenderId: "503663950718",
    appId: "1:503663950718:web:8a30b18039c279ffac112f",
    measurementId: "G-1K7QHDXKQ2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. Initializations
(function() {
    emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); 
})();

function generatePartnerID() {
    return 'AA' + Math.floor(100000 + Math.random() * 900000);
}

function generateRandomPassword() {
    return Math.random().toString(36).slice(-8).toUpperCase();
}

// 3. Optimized Form Listener
document.getElementById('eliteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const aadhar = document.getElementById('aadhar').value;
    const pan = document.getElementById('pan').value.toUpperCase();
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

    // --- PHASE 1: FRONTEND VALIDATION ---
    if (aadhar.length !== 12) {
        alert('Aadhar must be exactly 12 digits'); 
        return;
    }
    if (!panRegex.test(pan)) {
        alert('Invalid PAN Format (e.g. ABCDE1234F)'); 
        return;
    }

    // Prepare User Data Object
    const formData = {
        role: document.getElementById('role').value,
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        shop: document.getElementById('shop').value,
        state: document.getElementById('state').value,
        aadhar: aadhar,
        pan: pan,
        userId: generatePartnerID(),
        password: generateRandomPassword(),
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    // UI Loading State
    btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> Checking Details...';
    btn.disabled = true;

    try {
        // --- PHASE 2: DUPLICATE CHECKS (Firestore Queries) ---
        
        // Mobile Check
        const mobileCheck = await db.collection("partners").where("mobile", "==", formData.mobile).get();
        if (!mobileCheck.empty) { throw new Error("Ye Mobile Number pehle se registered hai!"); }

        // Aadhar Check
        const aadharCheck = await db.collection("partners").where("aadhar", "==", formData.aadhar).get();
        if (!aadharCheck.empty) { throw new Error("Ye Aadhar Number pehle se registered hai!"); }

        // PAN Check
        const panCheck = await db.collection("partners").where("pan", "==", formData.pan).get();
        if (!panCheck.empty) { throw new Error("Yeh PAN Number pehle se registered hai!"); }

        // Email Check
        const emailCheck = await db.collection("partners").where("email", "==", formData.email).get();
        if (!emailCheck.empty) { throw new Error("Ye Email Address pehle se registered hai!"); }

        // --- PHASE 3: SAVE & NOTIFY ---
        
        btn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> Creating Account...';

        // Save to Firestore (Single Call)
        await db.collection("partners").doc(formData.userId).set(formData);

        // Send Email (Optional)
        try {
            await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                to_name: formData.name,
                to_email: formData.email,
                user_id: formData.userId,
                password: formData.password
            });
        } catch (mailErr) { console.warn("Email failed but data saved."); }

        // WhatsApp Logic
        const waMsg = `Hello ${formData.name}, Welcome to Apna Agency! Your ID: ${formData.userId}, Password: ${formData.password}. Please wait for Admin Approval.`;
        const waUrl = `https://wa.me/91${formData.mobile}?text=${encodeURIComponent(waMsg)}`;

        alert(`Registration Successful!\nUser ID: ${formData.userId}\nPassword: ${formData.password}`);
        
        window.open(waUrl, '_blank');
        window.location.reload();

    } catch (error) {
        console.error("Process Error:", error);
        alert(error.message); // Yahan wahi error dikhega jo check mein fail hua
        btn.innerHTML = 'Start Your Agency <i class="fas fa-arrow-right ml-3 text-sm"></i>';
        btn.disabled = false;
    }
});
    </script>