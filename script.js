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

// เพิ่มโค้ดนี้ต่อท้ายใน script.js ของคุณ
document.addEventListener("DOMContentLoaded", () => {
    // 1. ดึงค่า id จาก URL (เช่น ?id=adobe)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) return;

    // 2. ไปดึงข้อมูลจากไฟล์ JSON
    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            const product = data[productId];
            
            if (product) {
                // 3. เอาข้อมูลไปหยอดใส่ HTML ที่เราทำ id ไว้
                document.title = `${product.name} - 8Baht`;
                document.getElementById('product-name').innerText = product.name;
                document.getElementById('display-product-name').innerText = product.name;
                document.getElementById('product-logo').src = product.logo;
                document.getElementById('product-desc').innerText = product.description;
                
                // ตั้งค่าปุ่ม Copy
                const copyBtn = document.getElementById('copy-btn');
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(`${product.name}\nลิงก์ติดตั้ง: ${product.install_link}\n\nบริการช่วยเหลือ: https://8baht.com/help`);
                    copyBtn.innerText = "Copied!";
                    setTimeout(() => copyBtn.innerText = "Copy Link", 2000);
                };
            }
        });
});

// โหลดข้อมูลจากเครื่องเมื่อเปิดหน้าใหม่
let basket = JSON.parse(localStorage.getItem('copy_basket')) || [];

const helpLink = "บริการช่วยเหลือ: https://8baht.com/help";

// ฟังก์ชันอัปเดตหน้าตาตะกร้า
function updateBasketUI() {
    const basketEl = document.getElementById('copy-basket');
    const countEl = document.getElementById('basket-count');
    if(!basketEl) return;

    if (basket.length > 0) {
        basketEl.classList.add('basket-show');
        basketEl.classList.remove('basket-hidden');
        countEl.innerText = basket.length;
    } else {
        basketEl.classList.add('basket-hidden');
        basketEl.classList.remove('basket-show');
    }
}

// ระบบคัดลอก และ เพิ่มลงตะกร้า
document.addEventListener('click', function(e) {
    // 1. กด Copy Link ปกติ
    if (e.target.classList.contains('btn-copy')) {
        const text = e.target.getAttribute('data-url');
        navigator.clipboard.writeText(text).then(() => showToast());
    }

    // 2. กดปุ่ม + แอดลงตะกร้า
    if (e.target.classList.contains('btn-add-list')) {
        const name = e.target.getAttribute('data-name');
        const link = e.target.getAttribute('data-link');
        
        if (!basket.find(item => item.name === name)) {
            basket.push({ name, link });
            localStorage.setItem('copy_basket', JSON.stringify(basket));
            updateBasketUI();
            showToast(`เพิ่ม ${name} แล้ว`);
        }
    }
});

// 3. กดคัดลอกทั้งหมด
document.getElementById('btn-copy-bulk')?.addEventListener('click', function() {
    let combinedText = "";
    basket.forEach((item, index) => {
        combinedText += `${item.name}\nดาวน์โหลดติดตั้ง: ${item.link}\n${helpLink}`;
        if (index < basket.length - 1) combinedText += "\n\n---\n\n";
    });

    navigator.clipboard.writeText(combinedText).then(() => {
        showToast(`คัดลอกทั้งหมด ${basket.length} รายการแล้ว`);
    });
});

// 4. ล้างตะกร้า
document.getElementById('btn-clear-basket')?.addEventListener('click', () => {
    basket = [];
    localStorage.removeItem('copy_basket');
    updateBasketUI();
});

// รันครั้งแรกเมื่อโหลดหน้า
updateBasketUI();
