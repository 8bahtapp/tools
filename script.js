document.addEventListener("DOMContentLoaded", () => {
    // --- 1. เตรียมตัวแปรและสร้าง Overlay อัตโนมัติ ---
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-item");
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // สร้างฉากหลัง (Overlay) สำหรับปิดเมนู
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.id = 'menu-overlay';
    document.body.appendChild(overlay);

    // --- 2. ระบบเปิด/ปิดเมนูมือถือ (Click Outside to Close & Haptic) ---
    function toggleMenu() {
        const isOpen = mainNav.classList.toggle('active');
        overlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen); // ใช้ล็อก scroll ใน CSS
        
        // สั่นเบาๆ เวลาเปิดเมนู (Haptic)
        if (isOpen && navigator.vibrate) navigator.vibrate(10);
    }

    mobileToggle?.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu); // คลิกที่ว่างแล้วปิดทันที!

    // --- 3. Scroll Spy (ขีดสีฟ้าขยับตามการเลื่อน) ---
    function handleScrollSpy() {
        let currentId = "";
        const scrollPosition = window.scrollY + 100;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentId = section.getAttribute("id");
            }
        });

        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${currentId}`) {
                item.classList.add("active");
                // สำหรับมือถือ: ให้แถบเมนูเลื่อนมาตรงกลางถ้า Active
                if (window.innerWidth < 1100) {
                    item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }
            }
        });
    }
    if (sections.length > 0) window.addEventListener("scroll", handleScrollSpy);

    // --- 4. Smooth Scroll (คลิกเมนูแล้วเลื่อนนุ่มๆ) ---
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const targetId = item.getAttribute("href");
            if (targetId.startsWith("#")) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: "smooth"
                    });
                    // ปิดเมนูอัตโนมัติหลังคลิก (ถ้าเปิดอยู่)
                    if (mainNav.classList.contains('active')) toggleMenu();
                }
            }
        });
    });

    // --- 5. ระบบ Copy Link (Smart Icon + Vibration + Toast) ---
    
    // เตรียมไอคอน SVG (ไม่ต้องใส่ใน HTML)
    const linkIcon = `<svg class="icon-link" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
    const checkIcon = `<svg class="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:none; margin-right:6px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    // ใส่ไอคอนให้ปุ่ม Copy ทุกปุ่มตอนโหลดหน้า
    document.querySelectorAll('.btn-copy').forEach(btn => {
        const originalText = btn.innerText;
        btn.innerHTML = `${linkIcon}${checkIcon}<span class="btn-text">${originalText}</span>`;
    });

    function showToast(message) {
        const oldToast = document.querySelector('.copy-toast');
        if (oldToast) oldToast.remove();
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerHTML = `<span>✅</span> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-copy");
        if (!btn) return;

        const url = btn.dataset.url;
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            
            // สั่น Feedback แบบ Apple (Double Tap Feel)
            if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

            const iLink = btn.querySelector(".icon-link");
            const iCheck = btn.querySelector(".icon-check");
            const bText = btn.querySelector(".btn-text");

            // แสดงสถานะ Success
            btn.classList.add("success");
            if (iLink) iLink.style.display = "none";
            if (iCheck) iCheck.style.display = "inline-block";
            if (bText) bText.innerText = "Copied!";

            showToast("คัดลอกลิงก์เรียบร้อยแล้ว");

            // กลับสู่สถานะปกติหลังผ่านไป 2 วินาที
            setTimeout(() => {
                btn.classList.remove("success");
                if (iLink) iLink.style.display = "inline-block";
                if (iCheck) iCheck.style.display = "none";
                if (bText) bText.innerText = "Copy Link";
            }, 2000);

        } catch (err) {
            console.error("Copy failed", err);
        }
    });
});
