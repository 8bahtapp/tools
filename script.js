/************************************************************
 * 1) PIN SECURITY SYSTEM (คงเดิม)
 ************************************************************/
const CORRECT_PIN = "8888";
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12h

let inputCode = "";

function initPinSystem() {
    const authTime = localStorage.getItem('auth_time_8baht');
    const now = Date.now();
    if (authTime && (now - authTime < SESSION_DURATION)) return;

    const pinHtml = `
    <div id="pin-screen">
        <div class="pin-container">
            <img src="https://raw.githubusercontent.com/8bahtapp/web-images/refs/heads/main/icon-8baht.png" style="height:25px;margin-bottom:20px;">
            <p style="font-size:14px;color:#86868b;margin-bottom:20px;font-weight:500;">Enter Security PIN</p>

            <div class="pin-display-wrapper">
                <div class="pin-display" id="pin-dots"></div>
            </div>

            <div class="pin-grid">
                ${[1,2,3,4,5,6,7,8,9].map(n=>`
                    <button class="pin-btn" onclick="pressPin('${n}')" ontouchend="event.preventDefault();pressPin('${n}')">${n}</button>
                `).join("")}
                <button class="pin-btn special" onclick="clearPin()" ontouchend="event.preventDefault();clearPin()">Clear</button>
                <button class="pin-btn" onclick="pressPin('0')" ontouchend="event.preventDefault();pressPin('0')">0</button>
                <div style="visibility:hidden"></div>
            </div>
            <div id="pin-error" style="color:#ff3b30;font-size:12px;margin-top:20px;min-height:16px;font-weight:500;"></div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML("afterbegin", pinHtml);
}

window.pressPin = function(num) {
    if (inputCode.length >= 8) return;
    inputCode += num;
    document.getElementById("pin-dots").innerText = "*".repeat(inputCode.length);

    if (inputCode === CORRECT_PIN) {
        localStorage.setItem("auth_time_8baht", Date.now());
        const screen = document.getElementById("pin-screen");
        screen.style.opacity = "0";
        setTimeout(()=>screen.remove(), 400);
        return;
    }

    if (inputCode.length >= 4 && !CORRECT_PIN.startsWith(inputCode)) {
        document.getElementById("pin-error").innerText = "Incorrect PIN";
        setTimeout(clearPin, 500);
    }
};

window.clearPin = function() {
    inputCode = "";
    document.getElementById("pin-dots").innerText = "";
    document.getElementById("pin-error").innerText = "";
};

initPinSystem();

/************************************************************
 * 2) GLOBAL VARIABLES (คงเดิม)
 ************************************************************/
let basket = JSON.parse(localStorage.getItem("copy_basket")) || [];
const helpLink = "บริการช่วยเหลือ: https://8baht.com/help";

/************************************************************
 * 3) TOAST (คงเดิม)
 ************************************************************/
function showToast(msg="คัดลอกสำเร็จ!") {
    const toast = document.getElementById("copy-toast");
    if(!toast) return;
    toast.innerText = msg;
    toast.classList.add("show");
    toast.classList.remove("toast-hidden");
    setTimeout(()=>toast.classList.remove("show"), 2000);
}

/************************************************************
 * 4) BASKET UI (คงเดิม + ปรับ ID ให้ตรง HTML ใหม่)
 ************************************************************/
function updateBasketUI() {
    // ปรับ ID จาก copy-basket เป็น copy-basket-ui ให้ตรงกับ index.html ที่คุยกันก่อนหน้า
    const basketEl = document.getElementById("copy-basket-ui"); 
    const countEl = document.getElementById("basket-count");
    const previewList = document.getElementById("preview-list");
    if (!basketEl) return;

    if (basket.length) {
        basketEl.style.display = "block"; // ใช้ display แทน class เพื่อความชัวร์
        if(countEl) countEl.innerText = basket.length;

        if (previewList) {
            previewList.innerHTML = basket.map((item,i)=>`
                <div class="preview-item">
                    <span>${i+1}. ${item.name}</span>
                    <span class="btn-remove-item" onclick="removeItem(${i})">✕</span>
                </div>
            `).join("");
        }
    } else {
        basketEl.style.display = "none";
    }
}

window.removeItem = function(i) {
    basket.splice(i,1);
    localStorage.setItem("copy_basket", JSON.stringify(basket));
    updateBasketUI();
};

/************************************************************
 * 5) DOM READY (คงเดิม + ปรับ Path JSON)
 ************************************************************/
document.addEventListener("DOMContentLoaded", () => {

    /******** Mobile Menu ********/
    const mobileToggle = document.getElementById("mobile-toggle");
    const mainNav = document.getElementById("main-nav");

    let overlay = document.getElementById("menu-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "menu-overlay";
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        if (!mainNav) return;
        const isOpen = mainNav.classList.toggle("active");
        overlay.classList.toggle("active", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
    }

    mobileToggle?.addEventListener("click", toggleMenu);
    overlay?.addEventListener("click", toggleMenu);

    /******** Scroll Spy ********/
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-item");

    function handleScrollSpy() {
        let currentId = "";
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                currentId = section.id;
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href") === "#" + currentId) item.classList.add("active");
        });
    }

    window.addEventListener("scroll", handleScrollSpy);

    /******** Load Product JSON ********/
    // ปรับ Logic การดึง ID ให้รองรับโครงสร้างแบบ Folder
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts[pathParts.length - 2]; // ดึงชื่อโฟลเดอร์ เช่น 'adobe'

    if (productId && window.location.pathname.includes('/product/')) {
        // ถอยกลับ 2 ชั้นเพื่อไปหาไฟล์ JSON ที่ root/data/
        fetch("../../data/products.json")
        .then(r=>r.json())
        .then(data=>{
            const p = data[productId];
            if (!p) return;
            document.title = `${p.name} - 8Baht`;
            if(document.getElementById("product-name")) document.getElementById("product-name").innerText = p.name;
            if(document.getElementById("product-logo")) document.getElementById("product-logo").src = p.icon;
        });
    }

    updateBasketUI();
});

/************************************************************
 * 6) GLOBAL CLICK HANDLER (คงเดิม)
 ************************************************************/
document.addEventListener("click", (e) => {

    // Copy Single
    const copyBtn = e.target.closest(".btn-copy, .btn-copy-icon");
    if (copyBtn) {
        navigator.clipboard.writeText(copyBtn.dataset.url).then(()=>{
            showToast();
            const t = copyBtn.querySelector(".btn-text");
            if (t) {
                const old = t.innerText;
                t.innerText = "✔";
                setTimeout(()=>t.innerText = old, 1500);
            }
        });
        return;
    }

    // Add to Basket (จากปุ่มในหน้า Product)
    const addBtn = e.target.closest(".btn-add-basket"); // ปรับชื่อ Class ให้ตรงกับ CSS
    if (addBtn) {
        const name = addBtn.dataset.name;
        const link = addBtn.dataset.link;
        addToBasket(name, link);
        return;
    }

    // Bulk Copy (จากปุ่มในหน้าจอเมนูลอย)
    if (e.target.classList.contains("btn-copy-all")) {
        copyAllItems();
        return;
    }

    // Clear Basket
    if (e.target.classList.contains("btn-clear")) {
        clearBasket();
    }
});

/************************************************************
 * 7) GLOBAL FUNCTIONS (คงเดิมตาม Logic คุณ)
 ************************************************************/
window.addToBasket = function(name, link) {
    if (!basket.find(i=>i.name===name)) {
        basket.push({name, link});
        localStorage.setItem("copy_basket", JSON.stringify(basket));
        updateBasketUI();
        showToast("เพิ่ม "+name);
    }
};

window.copyAllItems = function() {
    let text = basket.map(i=>`${i.name}\nดาวน์โหลดติดตั้ง: ${i.link}`).join("\n\n---\n\n");
    text += `\n\n${helpLink}`;
    navigator.clipboard.writeText(text).then(()=>showToast(`คัดลอกรวม ${basket.length} รายการ`));
}

window.clearBasket = function() {
    basket = [];
    localStorage.removeItem("copy_basket");
    updateBasketUI();
    showToast("ล้างแล้ว");
}

updateBasketUI();
