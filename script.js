// --- PIN SYSTEM SETTINGS ---
const CORRECT_PIN = "8888";
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 Hours

function initPinSystem() {
    // ตรวจสอบ Session
    const authTime = localStorage.getItem('auth_time');
    const now = new Date().getTime();

    if (authTime && (now - authTime < SESSION_TIMEOUT)) {
        return; // เข้าใช้งานได้เลย
    }

    // สร้างหน้าจอ PIN ถ้ายังไม่ได้ล็อกอิน
    const pinHtml = `
        <div id="pin-screen">
            <img src="https://raw.githubusercontent.com/8bahtapp/web-images/refs/heads/main/icon-8baht.png" style="height:30px; margin-bottom:50px; opacity:0.5;">
            <div class="pin-display" id="pin-dots"></div>
            <div class="pin-grid">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-btn" onclick="pressPin('${n}')">${n}</button>`).join('')}
                <div></div><button class="pin-btn" onclick="pressPin('0')">0</button>
                <button class="pin-btn" onclick="clearPin()" style="font-size:14px; color:#ff3b30;">ลบ</button>
            </div>
            <div class="pin-error" id="pin-error"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', pinHtml);
}

let currentInput = "";
window.pressPin = function(num) {
    if (currentInput.length < 8) {
        currentInput += num;
        updateDots();
        
        // เช็ครหัสทันทีที่กด (ไม่ต้องกด OK)
        if (currentInput === CORRECT_PIN) {
            localStorage.setItem('auth_time', new Date().getTime());
            document.getElementById('pin-screen').style.opacity = '0';
            setTimeout(() => document.getElementById('pin-screen').remove(), 300);
        } else if (currentInput.length >= 4 && currentInput !== CORRECT_PIN) {
            // ถ้ายาวเกิน 4 ตัวแล้วยังผิด ให้รอแป๊บเดียวแล้วล้างใหม่
            if(currentInput.length >= 4) {
                 setTimeout(() => {
                    document.getElementById('pin-error').innerText = "รหัสผ่านไม่ถูกต้อง";
                    clearPin();
                 }, 200);
            }
        }
    }
}

window.clearPin = function() {
    currentInput = "";
    updateDots();
    document.getElementById('pin-error').innerText = "";
}

function updateDots() {
    const dots = document.getElementById('pin-dots');
    if (dots) dots.innerText = "*".repeat(currentInput.length);
}

// รันระบบ PIN
initPinSystem();

// --- ส่วนของ Code เดิมที่แถมมา ---
document.addEventListener("DOMContentLoaded", () => {
    // ... โค้ดเดิมของคุณทั้งหมด ...
});

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

    // --- 3. Copy System ---
    const linkIcon = `<svg class="icon-link" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:middle"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
    const checkIcon = `<svg class="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:none;margin-right:6px;vertical-align:middle"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    document.querySelectorAll('.btn-copy').forEach(btn => {
        const txt = btn.innerText;
        btn.innerHTML = `${linkIcon}${checkIcon}<span class="btn-text">${txt}</span>`;
    });

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-copy");
        if (!btn) return;
        const url = btn.dataset.url;
        try {
            await navigator.clipboard.writeText(url);
            if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

            btn.classList.add("success");
            btn.querySelector(".icon-link").style.display = "none";
            btn.querySelector(".icon-check").style.display = "inline-block";
            btn.querySelector(".btn-text").innerText = "Copied!";

            setTimeout(() => {
                btn.classList.remove("success");
                btn.querySelector(".icon-link").style.display = "inline-block";
                btn.querySelector(".icon-check").style.display = "none";
                btn.querySelector(".btn-text").innerText = "Copy Link";
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
