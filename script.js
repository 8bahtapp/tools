// --- PIN CONFIGURATION ---
const CORRECT_PIN = "8888";
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 Hours

function initPinSystem() {
    const authTime = localStorage.getItem('auth_time_8baht');
    const now = new Date().getTime();

    // ถ้าเคยล็อกอินแล้ว และยังไม่หมดเวลา 12 ชม. ให้จบการทำงาน
    if (authTime && (now - authTime < SESSION_DURATION)) return;

    // สร้าง UI (เพิ่ม ontouchend เพื่อป้องกันอาการหน่วงและซูมในมือถือ)
    const pinHtml = `
        <div id="pin-screen">
            <div class="pin-container">
                <img src="https://raw.githubusercontent.com/8bahtapp/web-images/refs/heads/main/icon-8baht.png" style="height:25px; margin-bottom:20px;">
                <p style="font-size:14px; color:#86868b; margin-bottom:20px; font-weight:500;">Enter Security PIN</p>
                
                <div class="pin-display-wrapper">
                    <div class="pin-display" id="pin-dots"></div>
                </div>

                <div class="pin-grid">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                        <button class="pin-btn" 
                            onclick="pressPin('${n}')" 
                            ontouchend="event.preventDefault(); pressPin('${n}')">${n}</button>
                    `).join('')}
                    <button class="pin-btn special" 
                        onclick="clearPin()" 
                        ontouchend="event.preventDefault(); clearPin()">Clear</button>
                    <button class="pin-btn" 
                        onclick="pressPin('0')" 
                        ontouchend="event.preventDefault(); pressPin('0')">0</button>
                    <div style="visibility:hidden"></div>
                </div>
                <div id="pin-error" style="color:#ff3b30; font-size:12px; margin-top:20px; min-height:16px; font-weight:500;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', pinHtml);
}

let inputCode = "";

window.pressPin = function(num) {
    if (inputCode.length < 8) {
        inputCode += num;
        const dotsDisplay = document.getElementById('pin-dots');
        if (dotsDisplay) dotsDisplay.innerText = "*".repeat(inputCode.length);
        
        // ตรวจสอบรหัสทันที
        if (inputCode === CORRECT_PIN) {
            localStorage.setItem('auth_time_8baht', new Date().getTime());
            const screen = document.getElementById('pin-screen');
            if (screen) {
                screen.style.transition = "opacity 0.4s ease";
                screen.style.opacity = "0";
                setTimeout(() => screen.remove(), 400);
            }
        } else if (inputCode.length >= 4 && inputCode !== CORRECT_PIN.substring(0, inputCode.length)) {
            const errorDisplay = document.getElementById('pin-error');
            if (errorDisplay) errorDisplay.innerText = "Incorrect PIN, please try again.";
            setTimeout(clearPin, 500);
        }
    }
}

window.clearPin = function() {
    inputCode = "";
    const dotsDisplay = document.getElementById('pin-dots');
    const errorDisplay = document.getElementById('pin-error');
    if (dotsDisplay) dotsDisplay.innerText = "";
    if (errorDisplay) errorDisplay.innerText = "";
}

// เรียกใช้งานระบบ PIN ทันที
initPinSystem();

// --- จบส่วนของ PIN เริ่มต้น Code เดิมของคุณด้านล่างนี้ ---

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Mobile Menu ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');

    let overlay = document.getElementById('menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        if (!mainNav) return;
        const isOpen = mainNav.classList.toggle('active');
        overlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            mainNav.style.overflowY = 'auto';
            mainNav.style.maxHeight = 'calc(100vh - 60px)';
        } else {
            document.body.style.overflow = '';
            mainNav.style.overflowY = '';
            mainNav.style.maxHeight = '';
        }

        if (isOpen && navigator.vibrate) navigator.vibrate(10);
    }

    mobileToggle?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    // --- 2. Scroll Spy ---
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-item");

    function handleScrollSpy() {
        let currentId = "";
        const scrollPosition = window.scrollY + 120;

        sections.forEach((section) => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                currentId = section.getAttribute("id");
            }
        });

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentId = sections[sections.length - 1]?.getAttribute("id");
        }

        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${currentId}`) {
                item.classList.add("active");
            }
        });
    }

    if (sections.length > 0) {
        window.addEventListener("scroll", handleScrollSpy);

        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                const href = item.getAttribute("href");
                if (href?.startsWith("#")) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
                        if (mainNav.classList.contains('active')) toggleMenu();
                    }
                }
            });
        });
    }

// --- 3. Copy System (ปรับปรุงใหม่: ลบไอคอนออก) ---
    document.querySelectorAll('.btn-copy').forEach(btn => {
        const txt = btn.innerText;
        btn.innerHTML = `<span class="btn-text">${txt}</span>`;
    });

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-copy");
        if (!btn) return;
        const url = btn.dataset.url;
        try {
            await navigator.clipboard.writeText(url);
            if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

            btn.classList.add("success");
            const btnText = btn.querySelector(".btn-text");
            btnText.innerText = "✔"; // เปลี่ยนข้อความเมื่อกดสำเร็จ

            setTimeout(() => {
                btn.classList.remove("success");
                btnText.innerText = "Copy Link"; // กลับมาเป็นข้อความเดิม (หรือใส่ข้อความที่คุณต้องการ)
            }, 2000);
        } catch (err) {
            console.error(err);
        }
    });

    // --- 4. FAQ Auto Scroll ---
    document.querySelectorAll("#faq details").forEach(detail => {
        detail.addEventListener("toggle", () => {
            if (detail.open) {
                detail.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });

});
/* ============================================================
   8Baht Tools - Main Scripts
   ============================================================ */

// --- 1. ตัวแปรส่วนกลาง (Global Variables) ---
let basket = [];

// --- 2. ระบบ Basket (ตะกร้าสะสมรายการ) ---

// ฟังก์ชันเพิ่มของลงตะกร้า
function addToBasket(name, url) {
    // ป้องกันการเพิ่มซ้ำ (Optional)
    const exists = basket.find(item => item.url === url);
    if (!exists) {
        basket.push({ name, url });
        updateBasketUI();
    }
    
    // แสดง Notification (เรียกใช้ Toast ที่คุณมีในหน้า HTML)
    if (typeof showToast === 'function') {
        showToast();
    } else {
        console.log("Item added: " + name);
    }
}

// ฟังก์ชันอัปเดตการแสดงผลตะกร้า
function updateBasketUI() {
    const basketUI = document.getElementById('copy-basket-ui');
    const basketCount = document.getElementById('basket-count');
    const previewList = document.getElementById('preview-list');

    if (!basketUI || !basketCount || !previewList) return;

    // ถ้าไม่มีของให้ซ่อน ถ้ามีของให้แสดง
    if (basket.length === 0) {
        basketUI.style.display = 'none';
        return;
    }

    basketUI.style.display = 'block';
    basketCount.innerText = basket.length;

    // สร้างรายการในตะกร้า
    previewList.innerHTML = basket.map((item, index) => `
        <div class="basket-item">
            <span>${item.name}</span>
            <button onclick="removeItem(${index})" style="background:none; border:none; color:#ff453a; cursor:pointer; padding:5px;">✕</button>
        </div>
    `).join('');
}

// ฟังก์ชันคัดลอกทั้งหมดในตะกร้า
function copyAllItems() {
    if (basket.length === 0) return;

    // 1. วนลูปสร้างรายการสินค้าแต่ละชิ้น
    let productLines = basket.map(item => {
        return `${item.name}\nดาวน์โหลดติดตั้ง: ${item.url}`;
    }).join('\n\n'); // เว้นบรรทัดระหว่างสินค้าแต่ละตัว

    // 2. กำหนดลิงก์บริการช่วยเหลือ (อันเดียวต่อท้าย)
    const helpLine = "\n\nบริการช่วยเหลือ: https://8baht.com/help";

    // 3. รวมร่างข้อความทั้งหมด
    const textToCopy = productLines + helpLine;

    // 4. สั่งคัดลอกลง Clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
        // แจ้งเตือนที่ปุ่มว่าสำเร็จ
        const btn = document.querySelector('.btn-copy-all');
        const originalText = btn.innerText;
        btn.innerText = 'คัดลอกสำเร็จ! ✅';
        btn.style.background = '#34c759'; // เปลี่ยนเป็นสีเขียวชั่วคราว
        btn.style.color = '#ffffff';

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = ''; // กลับไปใช้สีตาม CSS (สีขาว)
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('ไม่สามารถคัดลอกได้:', err);
    });
}

// ฟังก์ชันลบบางรายการ
function removeItem(index) {
    basket.splice(index, 1);
    updateBasketUI();
}

// ฟังก์ชันล้างตะกร้าทั้งหมด
function clearBasket() {
    if (confirm('คุณต้องการล้างรายการที่เลือกทั้งหมดใช่หรือไม่?')) {
        basket = [];
        updateBasketUI();
    }
}

// --- 3. ระบบ Mobile Menu & UI Interactions ---

document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    const menuOverlay = document.getElementById('menu-overlay');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            if (menuOverlay) menuOverlay.classList.toggle('active');
        });
    }

    // คลิก Overlay เพื่อปิดเมนู
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    }
});
