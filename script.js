// --- 1. PIN CONFIGURATION & SYSTEM (Slide to Unlock & Hidden PIN) ---
const SECRET_KEY = "ODg4OA=="; // รหัสผ่าน 8888 ถูกซ่อนไว้
const SESSION_DURATION = 12 * 60 * 60 * 1000; 

function initPinSystem() {
    const authTime = localStorage.getItem('auth_time_8baht');
    const now = new Date().getTime();
    if (authTime && (now - authTime < SESSION_DURATION)) return;

    const pinHtml = `
        <div id="pin-screen">
            <div class="pin-container">
                <p style="font-size:16px; color:#1d1d1f; margin-bottom:20px; font-weight:600;">Enter Security PIN</p>
                <div class="pin-display-wrapper">
                    <div class="pin-display" id="pin-dots"></div>
                </div>
                <div class="pin-grid">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                        <button class="pin-btn" onclick="pressPin('${n}')" ontouchend="event.preventDefault(); pressPin('${n}')">${n}</button>
                    `).join('')}
                    <button class="pin-btn special" onclick="clearPin()" ontouchend="event.preventDefault(); clearPin()">Clear</button>
                    <button class="pin-btn" onclick="pressPin('0')" ontouchend="event.preventDefault(); pressPin('0')">0</button>
                    <div style="visibility:hidden"></div>
                </div>
                
                <div id="pin-error" style="color:#ff3b30; font-size:12px; margin: 15px 0; min-height:16px; font-weight:500;"></div>

                <div class="slider-wrapper" id="slider-container" style="display:none;">
                    <div class="slider-bg">
                        <span class="slider-text">Slide to Unlock</span>
                        <div class="slider-handle" id="slider-handle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', pinHtml);
    initSlider(); 
}

let inputCode = "";

window.pressPin = function(num) {
    if (inputCode.length < 6) { 
        inputCode += num;
        const dotsDisplay = document.getElementById('pin-dots');
        if (dotsDisplay) dotsDisplay.innerText = "•".repeat(inputCode.length);
        
        // ใช้ Class แทนการเปลี่ยน Style โดยตรง
        const sliderContainer = document.getElementById('slider-container');
        if (sliderContainer) sliderContainer.classList.add('active');
    }
}

window.clearPin = function() {
    inputCode = "";
    const dotsDisplay = document.getElementById('pin-dots');
    const errorDisplay = document.getElementById('pin-error');
    const sliderContainer = document.getElementById('slider-container');
    
    if (dotsDisplay) dotsDisplay.innerText = "";
    if (errorDisplay) errorDisplay.innerText = "";
    
    // ลบ Class ออกเมื่อเคลียร์พิน
    if (sliderContainer) {
        sliderContainer.classList.remove('active');
    }
    resetSlider();
}

function initSlider() {
    const handle = document.getElementById('slider-handle');
    const container = document.querySelector('.slider-bg');
    if (!handle || !container) return;

    let isDragging = false;
    let startX = 0;

    const onStart = (e) => {
        isDragging = true;
        startX = (e.type === 'mousedown') ? e.pageX : e.touches[0].pageX;
        handle.style.transition = 'none';
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const currentX = (e.type === 'mousemove') ? e.pageX : e.touches[0].pageX;
        let deltaX = currentX - startX;
        const maxSlide = container.offsetWidth - handle.offsetWidth - 8;

        if (deltaX < 0) deltaX = 0;
        if (deltaX > maxSlide) deltaX = maxSlide;

        handle.style.transform = `translateX(${deltaX}px)`;
        
        if (deltaX >= maxSlide) {
            isDragging = false;
            validateAndUnlock();
        }
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        resetSlider();
    };

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, {passive: true});
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
}

function resetSlider() {
    const handle = document.getElementById('slider-handle');
    if (handle) {
        handle.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        handle.style.transform = 'translateX(0)';
    }
}

function validateAndUnlock() {
    // เช็ครหัสผ่านที่ Encode เป็น Base64
    if (btoa(inputCode) === SECRET_KEY) {
        localStorage.setItem('auth_time_8baht', new Date().getTime());
        const screen = document.getElementById('pin-screen');
        if (screen) {
            screen.style.transition = "opacity 0.4s ease";
            screen.style.opacity = "0";
            setTimeout(() => screen.remove(), 400);
        }
    } else {
        const errorDisplay = document.getElementById('pin-error');
        if (errorDisplay) errorDisplay.innerText = "Access Denied. Incorrect PIN.";
        resetSlider();
        setTimeout(clearPin, 800);
    }
}

initPinSystem();

// --- 2. BASKET SYSTEM ---
let basket = JSON.parse(localStorage.getItem('8baht_basket')) || [];

function updateBasketUI() {
    const basketUI = document.getElementById('copy-basket-ui');
    const basketCount = document.getElementById('basket-count');
    const previewList = document.getElementById('preview-list');
    localStorage.setItem('8baht_basket', JSON.stringify(basket));

    if (!basketUI || !basketCount || !previewList) return;
    if (basket.length === 0) {
        basketUI.style.display = 'none';
        return;
    }
    basketUI.style.display = 'block';
    basketCount.innerText = basket.length;
    previewList.innerHTML = basket.map((item, index) => `
        <div class="basket-item">
            <span>${item.name}</span>
            <button onclick="removeItem(${index})" style="background:none; border:none; color:#ff453a; cursor:pointer; padding:5px;">✕</button>
        </div>
    `).join('');
}

function addToBasket(name, url) {
    const exists = basket.find(item => item.url === url);
    if (!exists) {
        basket.push({ name, url });
        updateBasketUI();
    }
}

function removeItem(index) {
    basket.splice(index, 1);
    updateBasketUI();
}

function clearBasket() {
    if (confirm('ล้างรายการทั้งหมดใช่หรือไม่?')) {
        basket = [];
        updateBasketUI();
    }
}

function copyAllItems() {
    if (basket.length === 0) return;
    let productLines = basket.map(item => `${item.name}\nดาวน์โหลดติดตั้ง: ${item.url}`).join('\n\n');
    const textToCopy = productLines + "\n\nบริการช่วยเหลือ: https://8baht.com/help";
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.querySelector('.btn-copy-all');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = 'คัดลอกสำเร็จ';
            setTimeout(() => btn.innerText = originalText, 2000);
        }
    });
  
  function toggleBasket() {
    const basket = document.getElementById('copy-basket-ui');
    const icon = document.getElementById('minimize-icon');
    
    // สลับคลาส minimized
    basket.classList.toggle('minimized');
    
    // เปลี่ยนไอคอนระหว่าง - กับ +
    if (basket.classList.contains('minimized')) {
        icon.innerText = '+';
    } else {
        icon.innerText = '−';
    }
}

// (Option) ถ้าอยากให้กดที่หัวตะกร้าแล้วขยายได้เลย
document.querySelector('.basket-header').addEventListener('click', function(e) {
    const basket = document.getElementById('copy-basket-ui');
    if (basket.classList.contains('minimized') && e.target.tagName !== 'BUTTON') {
        toggleBasket();
    }
});
  
}

// --- 3. DOM INITIALIZATION (Unified) ---
document.addEventListener("DOMContentLoaded", () => {
    updateBasketUI(); 

    const mobileToggle = document.querySelector('.mobile-menu-btn'); 
    const mainNav = document.querySelector('.desktop-menu');
    
    let overlay = document.getElementById('menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'menu-overlay';
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        if (!mainNav) return;
        const isOpen = mainNav.classList.toggle('active');
        overlay.classList.toggle('active', isOpen);
        
        if (isOpen) {
            document.body.style.overflow = 'hidden'; 
            mainNav.style.maxHeight = 'calc(100vh - 48px)';
            mainNav.style.overflowY = 'auto'; 
            mainNav.style.webkitOverflowScrolling = 'touch';
        } else {
            document.body.style.overflow = '';
            mainNav.style.maxHeight = '';
            mainNav.style.overflowY = '';
        }
        if (isOpen && navigator.vibrate) navigator.vibrate(10);
    }

    // แก้ไขปัญหาคลิกหน้าเดิมแล้ว Error 404
    const navItems = document.querySelectorAll(".desktop-menu a");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const href = item.getAttribute("href");
            const currentPage = window.location.pathname;

            if (href && (href.includes(currentPage) || (currentPage.endsWith('/') && href.includes(currentPage.split('/').filter(Boolean).pop())))) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (mainNav.classList.contains('active')) toggleMenu();
            }
        });
    });

    mobileToggle?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    // Single Copy Button
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-copy");
        if (!btn) return;
        const url = btn.dataset.url;
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            btn.classList.add("success");
            const btnText = btn.querySelector(".btn-text") || btn;
            const originalText = btnText.innerText;
            btnText.innerText = "✔";
          
            setTimeout(() => {
              btnText.innerText = originalText;
              btn.classList.remove("success");
            }, 2000);
        } catch (err) { console.error(err); }
    });
});
window.addEventListener('DOMContentLoaded', () => {

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // ปรับช่วงที่จะให้เมนู Active (คำนวณจากกึ่งกลางจอ)
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // หา id ของ section ที่กำลังปรากฏบนจอ
                const id = entry.target.getAttribute('id');
                
                // ลบ class active ออกจากทุกเมนู
                document.querySelectorAll('.nav-item').forEach((nav) => {
                    nav.classList.remove('active');
                });
                
                // เพิ่ม class active ให้เมนูที่ตรงกับ id นั้น
                const activeNav = document.querySelector(`.nav-item[href="#${id}"]`);
                if (activeNav) {
                    activeNav.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // เริ่มตรวจจับทุก <section> ที่มี id
    document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
    });
});
function toggleBasket() {
    const basket = document.getElementById('copy-basket-ui');
    const icon = document.getElementById('minimize-icon');
    
    // สลับคลาส minimized
    basket.classList.toggle('minimized');
    
    // เปลี่ยนไอคอนระหว่าง - กับ +
    if (basket.classList.contains('minimized')) {
        icon.innerText = '+';
    } else {
        icon.innerText = '−';
    }
}

// (Option) ถ้าอยากให้กดที่หัวตะกร้าแล้วขยายได้เลย
document.querySelector('.basket-header').addEventListener('click', function(e) {
    const basket = document.getElementById('copy-basket-ui');
    if (basket.classList.contains('minimized') && e.target.tagName !== 'BUTTON') {
        toggleBasket();
    }
});
