/************************************************************
 * 1) CONFIG
 ************************************************************/
const CONFIG = {
    PIN: "8888",
    SESSION_DURATION: 12 * 60 * 60 * 1000,
    HELP_LINK: "บริการช่วยเหลือ: https://8baht.com/help"
};

/************************************************************
 * 2) GLOBAL STATE
 ************************************************************/
const State = {
    inputCode: "",
    basket: JSON.parse(localStorage.getItem("copy_basket")) || []
};

/************************************************************
 * 3) PIN SECURITY SYSTEM
 ************************************************************/
function initPinSystem() {
    const authTime = localStorage.getItem("auth_time_8baht");
    const now = Date.now();
    if (authTime && now - authTime < CONFIG.SESSION_DURATION) return;

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
                    <button class="pin-btn" data-pin="${n}">${n}</button>
                `).join("")}
                <button class="pin-btn special" data-action="clear">Clear</button>
                <button class="pin-btn" data-pin="0">0</button>
                <div style="visibility:hidden"></div>
            </div>
            <div id="pin-error" style="color:#ff3b30;font-size:12px;margin-top:20px;min-height:16px;font-weight:500;"></div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML("afterbegin", pinHtml);
}

function pressPin(num) {
    if (State.inputCode.length >= 8) return;
    State.inputCode += num;
    const dots = document.getElementById("pin-dots");
    if (dots) dots.innerText = "*".repeat(State.inputCode.length);

    if (State.inputCode === CONFIG.PIN) {
        localStorage.setItem("auth_time_8baht", Date.now());
        const screen = document.getElementById("pin-screen");
        if (screen) {
            screen.style.opacity = "0";
            setTimeout(()=>screen.remove(), 400);
        }
        return;
    }

    if (State.inputCode.length >= 4 && !CONFIG.PIN.startsWith(State.inputCode)) {
        const err = document.getElementById("pin-error");
        if (err) err.innerText = "Incorrect PIN";
        setTimeout(clearPin, 500);
    }
}

function clearPin() {
    State.inputCode = "";
    const dots = document.getElementById("pin-dots");
    const err = document.getElementById("pin-error");
    if (dots) dots.innerText = "";
    if (err) err.innerText = "";
}

/************************************************************
 * 4) TOAST
 ************************************************************/
function showToast(msg="คัดลอกสำเร็จ!") {
    const toast = document.getElementById("copy-toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add("show");
    toast.classList.remove("toast-hidden");
    setTimeout(()=>toast.classList.remove("show"), 2000);
}

/************************************************************
 * 5) BASKET UI
 ************************************************************/
function updateBasketUI() {
    const basketEl = document.getElementById("copy-basket-ui");
    const countEl = document.getElementById("basket-count");
    const previewList = document.getElementById("preview-list");
    if (!basketEl) return;

    if (State.basket.length) {
        basketEl.style.display = "block";
        if (countEl) countEl.innerText = State.basket.length;

        if (previewList) {
            previewList.innerHTML = State.basket.map((item,i)=>`
                <div class="preview-item">
                    <span>${i+1}. ${item.name}</span>
                    <span class="btn-remove-item" data-remove="${i}">✕</span>
                </div>
            `).join("");
        }
    } else {
        basketEl.style.display = "none";
    }
}

function removeItem(i) {
    State.basket.splice(i,1);
    localStorage.setItem("copy_basket", JSON.stringify(State.basket));
    updateBasketUI();
}

/************************************************************
 * 6) BASKET FUNCTIONS
 ************************************************************/
function addToBasket(name, link) {
    if (!State.basket.find(i=>i.name===name)) {
        State.basket.push({name, link});
        localStorage.setItem("copy_basket", JSON.stringify(State.basket));
        updateBasketUI();
        showToast("เพิ่ม " + name);
    }
}

function copyAllItems() {
    let text = State.basket.map(i=>`${i.name}\nดาวน์โหลดติดตั้ง: ${i.link}`).join("\n\n---\n\n");
    text += `\n\n${CONFIG.HELP_LINK}`;
    navigator.clipboard.writeText(text).then(()=>showToast(`คัดลอกรวม ${State.basket.length} รายการ`));
}

function clearBasket() {
    State.basket = [];
    localStorage.removeItem("copy_basket");
    updateBasketUI();
    showToast("ล้างแล้ว");
}

/************************************************************
 * 7) DOM READY
 ************************************************************/
document.addEventListener("DOMContentLoaded", () => {

    initPinSystem();
    updateBasketUI();

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

    /******** Product JSON ********/
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts[pathParts.length - 2];

    if (productId && window.location.pathname.includes('/product/')) {
        fetch("../../data/products.json")
        .then(r=>r.json())
        .then(data=>{
            const p = data[productId];
            if (!p) return;
            document.title = `${p.name} - 8Baht`;
            document.getElementById("product-name")?.innerText = p.name;
            const logo = document.getElementById("product-logo");
            if (logo) logo.src = p.icon;
        });
    }
});

/************************************************************
 * 8) GLOBAL CLICK HANDLER (Event Delegation)
 ************************************************************/
document.addEventListener("click", (e) => {

    // PIN Buttons
    const pinBtn = e.target.closest("[data-pin]");
    if (pinBtn) return pressPin(pinBtn.dataset.pin);

    if (e.target.closest("[data-action='clear']")) return clearPin();

    // Remove basket item
    const removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) return removeItem(parseInt(removeBtn.dataset.remove));

    // Copy button
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

    // Add basket
    const addBtn = e.target.closest(".btn-add-basket");
    if (addBtn) return addToBasket(addBtn.dataset.name, addBtn.dataset.link);

    // Bulk Copy
    if (e.target.classList.contains("btn-copy-all")) return copyAllItems();

    // Clear basket
    if (e.target.classList.contains("btn-clear")) return clearBasket();
});
