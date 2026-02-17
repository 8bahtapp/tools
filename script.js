/************************************************************
 * 1) PIN SECURITY SYSTEM
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
 * 2) GLOBAL VARIABLES FOR COPY SYSTEM
 ************************************************************/
let basket = JSON.parse(localStorage.getItem("copy_basket")) || [];
const helpLink = "บริการช่วยเหลือ: https://8baht.com/help";

/************************************************************
 * 3) TOAST
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
 * 4) BASKET UI
 ************************************************************/
function updateBasketUI() {
    const basketEl = document.getElementById("copy-basket");
    const countEl = document.getElementById("basket-count");
    const previewList = document.getElementById("preview-list");
    if (!basketEl) return;

    if (basket.length) {
        basketEl.classList.add("basket-show");
        basketEl.classList.remove("basket-hidden");
        countEl.innerText = basket.length;

        if (previewList) {
            previewList.innerHTML = basket.map((item,i)=>`
                <div class="preview-item">
                    <span>${i+1}. ${item.name}</span>
                    <span class="btn-remove-item" onclick="removeItem(${i})">✕</span>
                </div>
            `).join("");
        }
    } else {
        basketEl.classList.add("basket-hidden");
        basketEl.classList.remove("basket-show");
    }
}

window.removeItem = function(i) {
    basket.splice(i,1);
    localStorage.setItem("copy_basket", JSON.stringify(basket));
    updateBasketUI();
};

/************************************************************
 * 5) DOM READY
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

    /******** Copy Button UI ********/
    document.querySelectorAll(".btn-copy").forEach(btn => {
        btn.innerHTML = `<span class="btn-text">${btn.innerText}</span>`;
    });

    /******** FAQ Auto Scroll ********/
    document.querySelectorAll("#faq details").forEach(d => {
        d.addEventListener("toggle", ()=> d.open && d.scrollIntoView({behavior:"smooth", block:"center"}));
    });

    /******** Load Product JSON ********/
    const params = new URLSearchParams(location.search);
    const productId = params.get("id");

    if (productId) {
        fetch("data/products.json")
        .then(r=>r.json())
        .then(data=>{
            const p = data[productId];
            if (!p) return;
            document.title = `${p.name} - 8Baht`;
            document.getElementById("product-name")?.innerText = p.name;
            document.getElementById("display-product-name")?.innerText = p.name;
            document.getElementById("product-logo")?.src = p.logo;
            document.getElementById("product-desc")?.innerText = p.description;
        });
    }

    updateBasketUI();
});

/************************************************************
 * 6) GLOBAL CLICK HANDLER (COPY + BASKET)
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

    // Add to Basket
    const addBtn = e.target.closest(".btn-add-list");
    if (addBtn) {
        const name = addBtn.dataset.name;
        const link = addBtn.dataset.link;
        if (!basket.find(i=>i.name===name)) {
            basket.push({name, link});
            localStorage.setItem("copy_basket", JSON.stringify(basket));
            updateBasketUI();
            showToast("เพิ่ม "+name);
        }
        return;
    }

    // Bulk Copy
    if (e.target.id === "btn-copy-bulk") {
        let text = basket.map(i=>`${i.name}\nดาวน์โหลดติดตั้ง: ${i.link}`).join("\n\n---\n\n");
        text += `\n\n${helpLink}`;
        navigator.clipboard.writeText(text).then(()=>showToast(`คัดลอกรวม ${basket.length} รายการ`));
        return;
    }

    // Clear Basket
    if (e.target.id === "btn-clear-basket") {
        basket = [];
        localStorage.removeItem("copy_basket");
        updateBasketUI();
        showToast("ล้างแล้ว");
    }
});

/************************************************************
 * 7) GLOBAL FUNCTION FOR INDEX PAGE (+ BUTTON)
 ************************************************************/
window.addToBasket = function(name, link) {
    if (!basket.find(i=>i.name===name)) {
        basket.push({name, link});
        localStorage.setItem("copy_basket", JSON.stringify(basket));
        updateBasketUI();
        showToast("เพิ่ม "+name);
    }
};

updateBasketUI();
