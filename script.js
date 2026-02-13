document.addEventListener("DOMContentLoaded", () => {
    // --- 1. จัดการเมนูมือถือ & Overlay (ใช้ร่วมกันทุกหน้า) ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // ตรวจสอบว่ามี Overlay ในหน้าหรือยัง ถ้าไม่มีให้สร้าง (ป้องกันพัง)
    let overlay = document.getElementById('menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    // ✅ REPLACED toggleMenu FUNCTION ONLY
    function toggleMenu() {
        if (!mainNav) return;
        const isOpen = mainNav.classList.toggle('active');
        overlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);

        // 🔥 เพิ่ม Lock Scroll Background + Scrollable Menu
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

    // --- 2. ระบบ Scroll Spy & Smooth Scroll (เฉพาะหน้าที่มี Sidebar) ---
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

        // ถ้าเลื่อนถึงล่างสุด ให้เมนูสุดท้าย Active
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
        
        // Smooth Scroll
        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                const href = item.getAttribute("href");
                if (href?.startsWith("#")) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
                        // ถ้าเป็นมือถือ ให้หุบเมนูหลังกด
                        if (mainNav.classList.contains('active')) toggleMenu();
                    }
                }
            });
        });
    }

    // --- 3. ระบบ Copy Link (Smart Icon + Vibration) ---
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
        } catch (err) { console.error(err); }
    });
});
