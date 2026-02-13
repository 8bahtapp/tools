document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-item");

    // --- ส่วนที่ 1: Scroll Spy (ทำให้ขีดสีฟ้าขยับตามการเลื่อนหน้าจอ) ---
    function handleScrollSpy() {
        let currentId = "";
        const scrollPosition = window.scrollY + 100; // ระยะเผื่อขอบบน

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
                
                // สำหรับมือถือ: ให้เมนูที่ Active เลื่อนมาตรงกลางหน้าจออัตโนมัติ (ถ้าเมนูยาวเกินจอ)
                if (window.innerWidth < 1100) {
                    item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }
            }
        });
    }

    // --- ส่วนที่ 2: คลิกที่เมนูแล้วเลื่อนนุ่มๆ (Smooth Scroll) ---
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.getAttribute("href");
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: "smooth"
                });
            }
        });
    });

    window.addEventListener("scroll", handleScrollSpy);

    // --- ส่วนที่ 3: ฟังก์ชัน Toast & Copy (ของเดิมที่คุณให้มา ปรับจูนเล็กน้อย) ---
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
            showToast("คัดลอกลิงก์เรียบร้อยแล้ว");

            const original = btn.innerText;
            btn.innerText = "Copied!";
            btn.classList.add("copied-active");

            setTimeout(() => {
                btn.innerText = original;
                btn.classList.remove("copied-active");
            }, 1500);
        } catch (err) {
            console.error("Copy failed", err);
        }
    });
});
