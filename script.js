// --- 0. GLOBAL UTILITIES ---
const showToast = () => {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.classList.remove('toast-hidden');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('toast-hidden');
    }, 2000);
};

// --- 1. PIN CONFIGURATION & SYSTEM ---
const SECRET_KEY = "ODg4OA=="; 
const SESSION_DURATION = 12 * 60 * 60 * 1000; 

function initPinSystem() {
    const authTime = localStorage.getItem('auth_time_8baht');
    const now = new Date().getTime();
    if (authTime && (now - authTime < SESSION_DURATION)) return;

    const pinHtml = `
        <div id="pin-screen">
            <div class="pin-container">
                <p style="font-size:16px; color:rgba(255,255,255,0.6); margin-bottom:20px; font-weight:600;">Enter Security PIN</p>
                <div class="pin-display-wrapper">
                    <div class="pin-display" id="pin-dots"></div>
                </div>
                <div class="pin-grid">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                        <button class="pin-btn" onclick="pressPin('${n}')">${n}</button>
                    `).join('')}
                    <button class="pin-btn special" onclick="clearPin()">Clear</button>
                    <button class="pin-btn" onclick="pressPin('0')">0</button>
                    <button class="pin-btn ok-btn" id="ok-button" onclick="validateAndUnlock()">OK</button>
                </div>
                <div id="pin-error" style="color:#ff3b30; font-size:12px; margin: 15px 0; min-height:16px; font-weight:500;"></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('afterbegin', pinHtml);
}

let inputCode = "";
window.pressPin = (num) => {
    if (inputCode.length < 6) { 
        inputCode += num;
        const dots = document.getElementById('pin-dots');
        if (dots) dots.innerText = "•".repeat(inputCode.length);
        document.getElementById('ok-button')?.classList.add('active');
    }
};
window.clearPin = () => {
    inputCode = "";
    document.getElementById('pin-dots').innerText = "";
    document.getElementById('pin-error').innerText = "";
    document.getElementById('ok-button').classList.remove('active');
};
window.validateAndUnlock = () => {
    if (btoa(inputCode) === SECRET_KEY) {
        localStorage.setItem('auth_time_8baht', new Date().getTime());
        const screen = document.getElementById('pin-screen');
        screen.style.opacity = "0";
        setTimeout(() => screen.remove(), 400);
    } else {
        document.getElementById('pin-error').innerText = "Access Denied.";
        setTimeout(clearPin, 800);
    }
};
initPinSystem();

// --- 2. BASKET SYSTEM ---
let basket = JSON.parse(localStorage.getItem('8baht_basket')) || [];
// โหลดสถานะการยุบจากเครื่อง (ถ้าไม่เคยตั้งค่าให้เป็น false)
let isMinimized = JSON.parse(localStorage.getItem('8baht_minimized')) || false;

function updateBasketUI() {
    const basketUI = document.getElementById('copy-basket-ui');
    const basketCount = document.getElementById('basket-count');
    const previewList = document.getElementById('preview-list');
    const fabIcon = document.getElementById('basket-floating-icon');
    const fabCount = document.getElementById('fab-count');

    localStorage.setItem('8baht_basket', JSON.stringify(basket));
    localStorage.setItem('8baht_minimized', JSON.stringify(isMinimized));

    if (!basketUI || !basketCount || !previewList) return;

    if (basket.length === 0) {
        basketUI.style.display = 'none';
        if (fabIcon) fabIcon.style.display = 'none';
        return;
    }

    // จัดการการแสดงผลตามสถานะ IsMinimized
    if (isMinimized) {
        basketUI.style.display = 'none';
        if (fabIcon) {
            fabIcon.style.display = 'flex';
            if (fabCount) fabCount.innerText = basket.length;
        }
    } else {
        basketUI.style.display = 'block';
        if (fabIcon) fabIcon.style.display = 'none';
    }

    basketCount.innerText = basket.length;
    previewList.innerHTML = basket.map((item, index) => `
        <div class="basket-item">
            <span>${item.name}</span>
            <button onclick="removeItem(${index})" style="background:none; border:none; color:#ff453a; cursor:pointer;">✕</button>
        </div>`).join('');
}

// ฟังก์ชันสำหรับสลับสถานะ ยุบ/ขยาย
function toggleBasketUI(showFull) {
    isMinimized = !showFull;
    updateBasketUI();
}

function addToBasket(name, url) {
    if (!basket.find(item => item.url === url)) {
        basket.push({ name, url });
        // เมื่อกดเพิ่มใหม่ ให้ขยายหน้าจอออกมาเสมอ
        isMinimized = false; 
        updateBasketUI();
    }
}

function removeItem(index) {
    basket.splice(index, 1);
    updateBasketUI();
}

function clearBasket() {
    basket = [];
    isMinimized = false;
    updateBasketUI();
}

// เรียกใช้งานครั้งแรกเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', updateBasketUI);

function removeItem(index) { basket.splice(index, 1); updateBasketUI(); }
function clearBasket() { if (confirm('ล้างรายการ?')) { basket = []; updateBasketUI(); } }

function copyAllItems() {
    if (basket.length === 0) return;
    let text = basket.map(item => `${item.name}\nดาวน์โหลดติดตั้ง: ${item.url}`).join('\n\n');
    text += "\n\nบริการช่วยเหลือ: https://8baht.com/help";
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy-all');
        btn.innerText = 'คัดลอกสำเร็จ';
        setTimeout(() => btn.innerText = 'คัดลอกลิ้งก์ทั้งหมด', 2000);
    });
}

function toggleBasket() {
    const basketUI = document.getElementById('copy-basket-ui');
    const icon = document.getElementById('minimize-icon');
    basketUI.classList.toggle('minimized');
    if (icon) icon.innerText = basketUI.classList.contains('minimized') ? '+' : '−';
}

// --- 3. DOM INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    updateBasketUI(); 

    // Mobile Menu & Overlay
    const mobileToggle = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.desktop-menu');
    const overlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        const isOpen = mainNav.classList.toggle('active');
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    mobileToggle?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    // ระบบคัดลอกส่วนกลาง (FAQ & Cards)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-copy-icon, .btn-copy');
        if (btn && btn.hasAttribute('data-url')) {
            navigator.clipboard.writeText(btn.getAttribute('data-url')).then(showToast);
        }
    });

    // Intersection Observer for Sidebar
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelector(`.nav-item[href="#${id}"]`)?.classList.add('active');
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('section[id]').forEach(s => observer.observe(s));

    // --- DOC DOWNLOAD + COPY FIX ---
    document.querySelectorAll('.doc-card').forEach(card => {
        const mainLink = card.querySelector('.main-link');
        if (!mainLink) return;

        const fullUrl = mainLink.href;
        const fileName = card.querySelector('.doc-name')?.innerText || 'Document';
        const fileIdMatch = fullUrl.match(/\/d\/(.+?)\//);

        if (fileIdMatch) {
            const downloadBtn = card.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.href = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
                downloadBtn.target = "_blank";
            }
        }

        const copyBtn = card.querySelector('.btn-copy-icon');
        if (copyBtn && !copyBtn.hasAttribute('data-url')) { // ป้องกันทำงานซ้ำกับ logic ส่วนกลาง
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(`${fileName}\n${fullUrl}`).then(showToast);
            });
        }
    });
});
